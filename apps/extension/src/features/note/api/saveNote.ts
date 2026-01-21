import type { Database } from "@pickle/contracts";
import type {
  CreateNoteInput,
  StoredNoteData,
} from "@pickle/contracts/src/note";
import { DEFAULT_STORAGE_LIMIT_BYTES } from "@pickle/contracts/src/storage";
import { logger } from "@shared/lib/logger";
import {
  clearSession,
  getValidSession,
  refreshSession,
} from "@shared/lib/supabase";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Supabase에 노트를 직접 저장하는 API 함수입니다.
 *
 * 이 함수는 Extension Background(Service Worker)에서 실행됩니다.
 * HTTP API를 거치지 않고 직접 Supabase DB와 통신하므로 응답 속도가 빠릅니다.
 *
 * [리팩토링] 새로운 Supabase 래퍼 사용:
 * - getValidSession(): 요청 전 토큰 유효성 검증 + 자동 갱신
 * - 토큰 만료 시 Refresh Token으로 자동 갱신 시도
 */
export async function saveNoteToSupabase(note: CreateNoteInput) {
  try {
    // 1. 유효한 세션 가져오기 (만료 임박 시 자동 갱신)
    const session = await getValidSession();

    if (!session?.access_token) {
      return {
        success: false,
        error: "Unauthorized: 로그인 세션이 없습니다.",
      };
    }

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return {
        success: false,
        error: "Configuration Error: Supabase 설정이 누락되었습니다.",
      };
    }

    // 2. 인증된 Supabase 클라이언트 생성
    const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      },
    });

    // 3. User ID 확인 (세션에서 직접 가져옴)
    const userId = session.user?.id;

    if (!userId) {
      return {
        success: false,
        error: "Unauthorized: 유효하지 않은 세션입니다.",
      };
    }

    // 4-1. Workspace 조회
    const { data: workspaceMember, error: wsError } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", userId)
      .limit(1)
      .single();

    if (wsError) {
      logger.error("Workspace Fetch Error", { error: wsError });

      // 🚨 토큰 만료 시 자동 갱신 시도 (L2 전략)
      if (
        wsError.code === "PGRST301" ||
        wsError.message.includes("JWT expired")
      ) {
        logger.debug("[SaveNote] Token expired, attempting refresh");
        const newSession = await refreshSession();

        if (newSession) {
          // 새 토큰으로 재시도
          logger.debug("[SaveNote] Token refreshed, retrying save");
          return saveNoteToSupabase(note);
        }

        // 갱신 실패 시 세션 삭제
        await clearSession();
        return {
          success: false,
          error: "세션이 만료되었습니다. 다시 로그인해주세요.",
        };
      }

      return {
        success: false,
        error: `Workspace Access Error: ${wsError.message}`,
      };
    }

    if (!workspaceMember) {
      logger.error("No Workspace Found for User", { userId });
      return {
        success: false,
        error:
          "No Workspace: 연결된 워크스페이스가 없습니다. (회원가입 미완료 가능성)",
      };
    }

    // 5. 스토리지 용량 사전 체크 (통합)
    const { data: usage, error: usageError } = await supabase.rpc(
      "get_workspace_storage_info" as "get_workspace_storage_info",
      {
        p_workspace_id: workspaceMember.workspace_id,
      },
    );

    if (usageError) {
      logger.error("Storage usage check failed", { error: usageError });
    } else {
      const usageInfo = Array.isArray(usage) ? usage[0] : usage;
      const { total_used_bytes, limit_bytes } = usageInfo || {
        total_used_bytes: 0,
        limit_bytes: DEFAULT_STORAGE_LIMIT_BYTES,
      };

      /**
       * 테스트용: limit_bytes를 강제로 상수로 고정
       */
      // const { total_used_bytes } = usageInfo || { total_used_bytes: 0 };
      // const limit_bytes = DEFAULT_STORAGE_LIMIT_BYTES; // 무조건 상수값 사용

      // 이미지/캡처의 경우 업로드할 파일 크기까지 미리 fetch해서 계산함
      let incomingSize = 0;
      let imageBlob: Blob | null = null;
      let imageDimensions: { width: number; height: number } | null = null;

      if (note.type === "image" || note.type === "capture") {
        const imageUrl = note.data.image_url;
        if (imageUrl) {
          const res = await fetch(imageUrl);
          imageBlob = await res.blob();
          incomingSize = imageBlob.size;

          // 실제 해상도 추출
          const bitmap = await createImageBitmap(imageBlob);
          imageDimensions = { width: bitmap.width, height: bitmap.height };
          bitmap.close();
        }
      }

      // 최종 용량 검증
      if (Number(total_used_bytes) + incomingSize > Number(limit_bytes)) {
        return {
          success: false,
          error: `스토리지 용량이 부족합니다. (한도: ${(Number(limit_bytes) / (1024 * 1024)).toFixed(0)}MB, 현재 ${(Number(total_used_bytes) / (1024 * 1024)).toFixed(1)}MB 사용 중)`,
        };
      }

      // 이미지 데이터 세팅 (이후 로직에서 재사용)
      if (imageBlob && imageDimensions) {
        // @ts-expect-error - 로직 흐름상 아래에서 사용하기 위해 임시 할당 (리팩토링 시 구조 개선 가능)
        note._prepared_blob = imageBlob;
        // @ts-expect-error
        note._prepared_dimensions = imageDimensions;
      }
    }

    // 6. 이미지/캡처 업로드 처리
    let assetId: string | null = null;
    let filePath: string | undefined; // Debugging용 변수

    // 기본적으로 note.data를 그대로 쓰되, 업로드 된 이미지 정보만 덮어씌움
    let storedData: StoredNoteData = note.data;

    // 5-0. Bookmark 외부 이미지 해상도 추출 (업로드는 하지 않음)
    if (note.type === "bookmark" && note.meta.image) {
      try {
        const res = await fetch(note.meta.image);
        if (res.ok) {
          const blob = await res.blob();
          const bitmap = await createImageBitmap(blob);
          note.meta.image_width = bitmap.width;
          note.meta.image_height = bitmap.height;
          bitmap.close();
        }
      } catch (e) {
        logger.warn("[SaveNote] Failed to fetch bookmark image dimensions", {
          error: e,
        });
      }
    }

    // 6-1. 실제 업로드 수행
    if (note.type === "image" || note.type === "capture") {
      // @ts-expect-error
      const blob = note._prepared_blob as Blob | undefined;
      // @ts-expect-error
      const dimensions = note._prepared_dimensions as
        | { width: number; height: number }
        | undefined;

      if (blob && dimensions) {
        const fileSize = blob.size;
        const fileName = `${crypto.randomUUID()}.png`;
        filePath = `${workspaceMember.workspace_id}/${userId}/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("bitmaps")
          .upload(filePath, blob, {
            contentType: "image/png",
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`이미지 업로드 실패: ${uploadError.message}`);
        }

        // 6-2. Assets 테이블 Insert
        const { data: assetData, error: assetError } = await supabase
          .from("assets")
          .insert({
            workspace_id: workspaceMember.workspace_id,
            owner_id: userId,
            type: note.type,
            full_path: uploadData.path,
            full_size_bytes: fileSize,
            width: dimensions.width,
            height: dimensions.height,
            blur_data_url: note.blurDataUrl ?? null,
          })
          .select()
          .single();

        if (assetError) {
          throw new Error(`에셋 메타데이터 저장 실패: ${assetError.message}`);
        }

        assetId = assetData.id;

        // 6-3. storedData 업데이트
        if (note.type === "image") {
          storedData = {};
        } else if (note.type === "capture") {
          storedData = {
            display_width: note.data.display_width,
            display_height: note.data.display_height,
          };
        }
      }
    }

    // 7. DB InsertPayload 준비
    // 핵심 변경: meta를 별도 컬럼으로 저장 (Data에 중첩 X)
    const insertPayload: Database["public"]["Tables"]["notes"]["Insert"] = {
      workspace_id: workspaceMember.workspace_id,
      user_id: userId,
      asset_id: assetId,
      type: note.type,
      title: note.title ?? null, // [Refactor] Add title mapping
      url: note.meta.url,
      meta: note.meta,
      memo: note.memo ?? null,
      data: storedData,
      tags: note.tags ?? [],
    };

    // 7. Insert 실행
    const { data, error } = await supabase
      .from("notes")
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      logger.error("Supabase Write Error", { error });
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: data,
      debug: { filePath, workspaceId: workspaceMember.workspace_id },
    };
  } catch (error) {
    logger.error("Background Save Error", { error });
    return { success: false, error: (error as Error).message };
  }
}

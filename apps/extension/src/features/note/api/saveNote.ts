import type { Database } from "@pickle/contracts";
import type {
  CreateNoteInput,
  StoredNoteData,
} from "@pickle/contracts/src/note";
import { createClient, type Session } from "@supabase/supabase-js";

/**
 * Supabase에 노트를 직접 저장하는 API 함수입니다.
 *
 * 이 함수는 Extension Background(Service Worker)에서 실행됩니다.
 * HTTP API를 거치지 않고 직접 Supabase DB와 통신하므로 응답 속도가 빠릅니다.
 */
export async function saveNoteToSupabase(note: CreateNoteInput) {
  try {
    // 1. 인증 토큰 가져오기 (from Local Storage)
    // 웹에서 로그인할 때 동기화된 `access_token`을 꺼냅니다.
    const result = await chrome.storage.local.get("supabaseSession");
    const supabaseSession = result.supabaseSession as
      | { access_token?: string }
      | undefined;

    if (!supabaseSession?.access_token) {
      return {
        success: false,
        error: "Unauthorized: 로그인 세션이 없습니다.",
      };
    }

    // 2. 환경 변수 로드 (Vite Define에 의해 빌드 시 주입됨)
    const SUPABASE_URL = import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_ANON_KEY = import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return {
        success: false,
        error: "Configuration Error: Supabase 설정이 누락되었습니다.",
      };
    }

    // 3. Supabase 클라이언트 초기화
    // 핵심: Authorization 헤더에 사용자의 access_token을 심어서 요청합니다.
    // 이렇게 하면 Supabase가 사용자를 식별하고 RLS(Row Level Security) 정책을 적용할 수 있습니다.
    const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: `Bearer ${supabaseSession.access_token}`,
        },
      },
    });

    // 4. User ID 확인
    const session = result.supabaseSession as Session | null;
    let userId = session?.user?.id;

    if (!userId) {
      // 만약 세션 객체에 ID가 없다면, 토큰을 이용해 서버에 물어봅니다 (Fallback)
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        return {
          success: false,
          error: "Unauthorized: 유효하지 않은 토큰입니다.",
        };
      }
      userId = user.id;
    }

    // 4-1. Workspace 조회
    const { data: workspaceMember, error: wsError } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", userId)
      .limit(1)
      .single();

    if (wsError) {
      console.error("Workspace Fetch Error:", wsError);

      // 🚨 Auto-Recovery: 토큰 만료 시 세션 삭제 (재로그인 유도)
      if (
        wsError.code === "PGRST301" ||
        wsError.message.includes("JWT expired")
      ) {
        await chrome.storage.local.remove("supabaseSession");
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
      console.error("No Workspace Found for User:", userId);
      return {
        success: false,
        error:
          "No Workspace: 연결된 워크스페이스가 없습니다. (회원가입 미완료 가능성)",
      };
    }

    // 5. 이미지/캡처 업로드 처리
    let assetId: string | null = null;
    let filePath: string | undefined; // Debugging용 변수

    // Meta 분리 로직 제거 -> Note.data 자체가 이미 Clean함 (CreateNoteInput 정의)
    // 단, 이미지 처리를 위해 URL/Path 업데이트가 필요할 수 있음.

    // 기본적으로 note.data를 그대로 쓰되, 업로드 된 이미지 정보만 덮어씌움
    let storedData: StoredNoteData = note.data;

    // Discriminated Union 덕분에 note.type 체크 시 note.data가 자동으로 Narrowing 됨
    if (note.type === "image" || note.type === "capture") {
      const imageUrl = note.data.image_url;

      if (imageUrl) {
        // 5-1. Fetch Image
        const res = await fetch(imageUrl);
        const blob = await res.blob();
        const fileSize = blob.size;

        const { data: usage, error: usageError } = await supabase.rpc(
          "get_workspace_storage_info" as "get_workspace_storage_info",
          {
            p_workspace_id: workspaceMember.workspace_id,
          },
        );

        if (usageError) {
          console.error("Storage usage check failed:", usageError);
        } else {
          const usageInfo = Array.isArray(usage) ? usage[0] : usage;
          const { total_used_bytes, limit_bytes } = usageInfo || {
            total_used_bytes: 0,
            limit_bytes: 52428800,
          };

          if (Number(total_used_bytes) + fileSize > Number(limit_bytes)) {
            return {
              success: false,
              error: `스토리지 용량이 부족합니다. (한도: ${(Number(limit_bytes) / (1024 * 1024)).toFixed(0)}MB, 현재 ${(Number(total_used_bytes) / (1024 * 1024)).toFixed(1)}MB 사용 중)`,
            };
          }
        }

        const fileName = `${crypto.randomUUID()}.png`;

        // Folder Structure: {workspace_id}/{user_id}/{filename}
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

        // 5-2. Assets 테이블 Insert
        const { data: assetData, error: assetError } = await supabase
          .from("assets")
          .insert({
            workspace_id: workspaceMember.workspace_id,
            owner_id: userId,
            type: note.type,
            full_path: uploadData.path,
            full_size_bytes: fileSize,
            blur_data_url: note.blurDataUrl ?? null,
          })
          .select()
          .single();

        if (assetError) {
          throw new Error(`에셋 메타데이터 저장 실패: ${assetError.message}`);
        }

        assetId = assetData.id;

        // 5-3. storedData 업데이트 (Clean Data 유지)
        if (note.type === "image") {
          storedData = {
            // [Refactor] Image data is empty
          };
        } else if (note.type === "capture") {
          storedData = {
            display_width: note.data.display_width,
            display_height: note.data.display_height,
          };
        }
      }
    }

    // 6. DB InsertPayload 준비
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
      console.error("Supabase Write Error:", error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: data,
      debug: { filePath, workspaceId: workspaceMember.workspace_id },
    };
  } catch (error) {
    console.error("Background Save Error:", error);
    return { success: false, error: (error as Error).message };
  }
}

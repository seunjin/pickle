import type { Database } from "@pickle/contracts";
import type { CreateNoteInput } from "@pickle/contracts/src/note";
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

    if (wsError || !workspaceMember) {
      return {
        success: false,
        error: "No Workspace: 워크스페이스를 찾을 수 없습니다.",
      };
    }

    // 5. DB InsertPayload 준비
    // Database 타입 정의에 맞춰 데이터를 매핑합니다.
    const insertPayload = {
      workspace_id: workspaceMember.workspace_id,
      user_id: userId,
      type: note.type,
      url: note.url,
      content: note.content ?? null,
      data: note.data,
      tags: note.tags ?? [],
    };

    // 6. 실제 Insert 쿼리 실행
    const { data, error } = await supabase
      .from("notes")
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error("Supabase Write Error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data };
  } catch (error) {
    console.error("Background Save Error:", error);
    return { success: false, error: (error as Error).message };
  }
}

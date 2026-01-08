import { createClient } from "@/shared/lib/supabase/server";
import { getUser } from "./getUser";
import { getUserWorkspaces } from "./getUserWorkspaces";

/**
 * 서버 사이드에서 현재 사용자의 인증 상태와 애플리케이션 유저 정보를 가져옵니다.
 * 이 함수는 서버 컴포넌트, Server Actions, Route Handlers에서 사용할 수 있습니다.
 */
export const getServerAuth = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, appUser: null, workspace: null, supabase };
  }

  // ✅ 병렬로 appUser와 workspaces를 조회하여 성능 최적화
  const [appUser, workspaces] = await Promise.all([
    getUser(supabase, user.id),
    getUserWorkspaces(supabase, user.id),
  ]);

  // 첫 번째 워크스페이스를 기본값으로 사용
  const workspace = workspaces.length > 0 ? workspaces[0] : null;

  return { user, appUser, workspace, supabase };
};

import { createClient } from "@/shared/lib/supabase/server";
import { getUser } from "./getUser";

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
    return { user: null, appUser: null, supabase };
  }

  const appUser = await getUser(supabase, user.id);

  return { user, appUser, supabase };
};

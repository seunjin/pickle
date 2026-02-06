import { useNavigate } from "@tanstack/react-router";
import { createClient } from "@/shared/lib/supabase";

/**
 * 로그아웃 기능을 제공하는 훅
 * Supabase signOut 호출 후 /signin 페이지로 이동
 */
export function useSignOut() {
  const navigate = useNavigate();

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    navigate({ to: "/signin", replace: true });
  };

  return { signOut };
}

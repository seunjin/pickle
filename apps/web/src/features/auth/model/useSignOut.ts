"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/shared/lib/supabase/client";

/**
 * 로그아웃 기능을 제공하는 훅
 * Supabase signOut 호출 후 router.refresh()로 세션 상태를 갱신
 */
export function useSignOut() {
  const router = useRouter();

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  };

  return { signOut };
}

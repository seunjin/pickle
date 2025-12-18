"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUser } from "@/features/auth/model/useUser";
import { createClient } from "@/shared/lib/supabase/client";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, appUser, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // 1. 미로그인 상태 -> 랜딩 페이지로 이동
      if (!user) {
        router.replace("/");
        return;
      }

      // 2. 로그인했으나 프로필이 없는 상태 (예: DB에서 수동 삭제됨) -> 다음 로그인 시 자동 복구를 위해 강제 로그아웃
      if (!appUser) {
        // 클라이언트 사이드에서 로그아웃을 실행하여, 사용자가 다시 로그인 버튼을 누르게 유도함
        // 재로그인 시 route.ts의 복구 로직이 실행됨
        const supabase = createClient();
        supabase.auth.signOut().then(() => router.replace("/"));
        return;
      }

      // 3. 로그인했으나 가입 대기 상태 (약관 미동의) -> 약관 동의 페이지로 이동
      if (appUser.status === "pending") {
        router.replace("/signup");
        return;
      }

      // 4. 활동 가능(Active) 상태 -> 통과
    }
  }, [user, appUser, isLoading, router]);

  if (isLoading || !user || appUser?.status !== "active") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}

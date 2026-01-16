"use client";

import { Spinner } from "@pickle/ui";
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

      // 2. 로그인했으나 프로필이 없는 상태 (예: 탈퇴 후 재로그인/DB 미동기화) -> 홈으로 보내서 확인창 띄움
      if (!appUser) {
        router.replace("/?reason=no_profile");
        return;
      }

      // 3. 로그인했으나 가입 대기 상태 (약관 미동의) -> 홈으로 보내서 확인창 띄움
      if (appUser.status === "pending") {
        router.replace("/?reason=no_profile");
        return;
      }

      // 4. 활동 가능(Active) 상태 -> 통과
    }
  }, [user, appUser, isLoading, router]);

  if (isLoading || !user || appUser?.status !== "active") {
    return (
      <div className="effect-bg flex min-h-screen items-center justify-center">
        <Spinner className="size-8 text-base-primary" />
      </div>
    );
  }

  return <>{children}</>;
}

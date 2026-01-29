import { Spinner } from "@pickle/ui";
import { useEffect } from "react";
import { useUser } from "../model/useUser";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, appUser, isLoading } = useUser();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // CSR 환경에서는 window.location.href 혹은 전역 라우터를 사용하여 이동
        // 일단은 www. 도메인 주소로 보냅니다.
        const signinUrl = `${import.meta.env.VITE_WWW_URL || "http://localhost:3000"}/signin`;
        window.location.href = signinUrl;
        return;
      }

      if (!appUser || appUser.status !== "active") {
        const signinUrl = `${import.meta.env.VITE_WWW_URL || "http://localhost:3000"}/signin?reason=no_profile`;
        window.location.href = signinUrl;
        return;
      }
    }
  }, [user, appUser, isLoading]);

  if (isLoading || !user || appUser?.status !== "active") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base-background">
        <Spinner className="size-8 text-base-primary" />
      </div>
    );
  }

  return <>{children}</>;
}

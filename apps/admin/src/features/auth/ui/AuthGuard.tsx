import { Spinner } from "@pickle/ui";
import { useEffect } from "react";
import { useUser } from "../model/useUser";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, appUser, isLoading } = useUser();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        const signinUrl = `${import.meta.env.VITE_WWW_URL || "http://localhost:3000"}/signin`;
        window.location.href = signinUrl;
        return;
      }

      // 관리자 전용 보호 로직 (role_admin 권한 확인 등으로 확장 가능)
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

import { Spinner } from "@pickle/ui";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useUser } from "../model/useUser";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, appUser, isLoading } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate({ to: "/signin", replace: true });
        return;
      }

      if (!appUser || appUser.status !== "active") {
        // 프로필이 없는 유저가 signin 페이지로 계속 튕기는 루프를 방지하기 위해 signup 페이지로 유도합니다.
        navigate({
          to: "/signup",
          search: { reason: "no_profile" },
          replace: true,
        });
        return;
      }
    }
  }, [user, appUser, isLoading, navigate]);

  if (isLoading || !user || appUser?.status !== "active") {
    return (
      <div className="effect-bg flex min-h-screen flex-col items-center justify-center bg-base-background">
        <Spinner className="size-8 text-base-primary" />
      </div>
    );
  }

  return <>{children}</>;
}

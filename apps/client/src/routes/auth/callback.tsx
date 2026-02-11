import { Spinner } from "@pickle/ui";
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { useUser } from "@/features/auth/model/useUser";

export const Route = createFileRoute("/auth/callback")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      next: (search.next as string) || "/",
    };
  },
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const { user, appUser, isLoading } = useUser();
  const navigate = useNavigate();
  const { next } = useSearch({ from: "/auth/callback" });

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // 인증 실패 시 로그인 페이지로
        navigate({ to: "/signin", replace: true });
        return;
      }

      if (!appUser || appUser.status !== "active") {
        // 프로필 미완성 시 가입 페이지로
        navigate({
          to: "/signup",
          search: { reason: "no_profile" },
          replace: true,
        });
        return;
      }

      // 모든 조건 만족 시 대시보드(또는 지정된 next)로 진입
      navigate({ to: next, replace: true });
    }
  }, [isLoading, user, appUser, navigate, next]);

  return (
    <div className="effect-bg flex min-h-screen flex-col items-center justify-center bg-base-background">
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="relative flex items-center justify-center">
          <div className="absolute size-16 animate-ping rounded-full bg-base-primary opacity-20" />
          <Spinner className="size-10 text-base-primary" />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="font-bold text-2xl text-white">
            잠시만 기다려 주세요
          </h2>
          <p className="animate-pulse font-medium text-gray-400">
            인증 정보를 확인하고 대시보드로 이동하고 있습니다...
          </p>
        </div>
      </div>
    </div>
  );
}

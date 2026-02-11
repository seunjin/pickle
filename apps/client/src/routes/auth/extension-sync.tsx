import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { logger } from "@/shared/lib/logger";
import { createClient } from "@/shared/lib/supabase";

export const Route = createFileRoute("/auth/extension-sync")({
  component: ExtensionSyncPage,
});

/**
 * Extension 로그인 후 세션을 전달받아 Client 앱에 설정하는 페이지.
 *
 * 흐름:
 * 1. Extension이 로그인 성공 후 이 페이지를 hash fragment로 토큰과 함께 열음
 * 2. hash에서 access_token, refresh_token 추출
 * 3. supabase.auth.setSession()으로 세션 설정
 * 4. 대시보드(/)로 리다이렉트
 */
function ExtensionSyncPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"syncing" | "error">("syncing");

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (!accessToken) {
      logger.warn("[ExtensionSync] hash에 access_token이 없음");
      setStatus("error");
      return;
    }

    const supabase = createClient();

    supabase.auth
      .setSession({
        access_token: accessToken,
        refresh_token: refreshToken ?? "",
      })
      .then(({ error }) => {
        // 보안: URL hash에서 토큰 제거
        window.history.replaceState(null, "", window.location.pathname);

        if (error) {
          logger.error("[ExtensionSync] 세션 설정 실패", { error });
          setStatus("error");
          return;
        }

        logger.info("[ExtensionSync] 세션 동기화 성공");
        navigate({ to: "/" });
      });
  }, [navigate]);

  if (status === "error") {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-base-background p-6 text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-red-500 text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={3}
            stroke="currentColor"
            className="size-6"
            role="img"
            aria-label="Error"
          >
            <title>Error</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h2 className="mb-2 font-bold text-xl">세션 동기화 실패</h2>
        <p className="mb-6 text-base-muted-foreground">
          익스텐션에서 다시 로그인해 주세요.
        </p>
        <button
          type="button"
          onClick={() => navigate({ to: "/signin" })}
          className="rounded-lg bg-base-primary px-6 py-2 font-medium text-white transition-colors hover:bg-base-primary/90"
        >
          로그인 페이지로
        </button>
      </div>
    );
  }

  // syncing 상태: 로딩 표시
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-base-background">
      <div className="mb-4 size-8 animate-spin rounded-full border-2 border-base-primary border-t-transparent" />
      <p className="text-base-muted-foreground">로그인 동기화 중...</p>
    </div>
  );
}

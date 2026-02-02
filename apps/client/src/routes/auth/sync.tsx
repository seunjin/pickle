import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useSessionContext } from "@/features/auth/model/SessionContext";
import { PageSpinner } from "@/features/note/ui/PageSpinner";
import { logger } from "@/shared/lib/logger";

const EXTENSION_ID = "pgbkfbhojodldapigoomjkglijnbjlkf";

export const Route = createFileRoute("/auth/sync")({
  component: SyncPage,
});

function SyncPage() {
  const { user, isLoading } = useSessionContext();
  const navigate = useNavigate();
  const [status, setStatus] = useState<
    "idle" | "syncing" | "success" | "error"
  >("idle");

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      navigate({ to: "/signin", search: { next: "/auth/sync" } });
      return;
    }

    const syncWithExtension = async () => {
      setStatus("syncing");

      const { createClient } = await import("@/shared/lib/supabase");
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setStatus("error");
        return;
      }

      try {
        if (
          typeof window !== "undefined" &&
          // @ts-expect-error
          window.chrome?.runtime?.sendMessage
        ) {
          // @ts-expect-error
          window.chrome.runtime.sendMessage(
            EXTENSION_ID,
            { type: "SYNC_SESSION", session },
            (response: { success: boolean }) => {
              if (response?.success) {
                setStatus("success");
                setTimeout(() => navigate({ to: "/" }), 1500);
              } else {
                logger.error("Failed to sync with extension", response);
                setStatus("error");
              }
            },
          );
        } else {
          logger.warn("Chrome extension API not available");
          setStatus("error");
        }
      } catch (err) {
        logger.error("Sync error", err);
        setStatus("error");
      }
    };

    syncWithExtension();
  }, [user, isLoading, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-base-background p-6 text-center">
      <div className="mb-8">
        <img
          src="/pickle-with-logo.svg"
          alt="Pickle"
          className="mx-auto w-32"
        />
      </div>

      <div className="max-w-md space-y-4">
        {status === "syncing" && (
          <>
            <PageSpinner />
            <h2 className="font-bold text-xl">익스텐션과 동기화 중...</h2>
            <p className="text-base-muted-foreground">
              로그인 정보를 브라우저 익스텐션으로 안전하게 전달하고 있습니다.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-green-500 text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={3}
                stroke="currentColor"
                className="size-6"
                role="img"
                aria-label="Success"
              >
                <title>Success</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"
                />
              </svg>
            </div>
            <h2 className="font-bold text-xl">동기화 완료!</h2>
            <p className="text-base-muted-foreground">
              이제 익스텐션에서도 피클을 활발하게 사용하실 수 있습니다.
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-500 text-white">
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
            <h2 className="font-bold text-red-500 text-xl">동기화 실패</h2>
            <p className="text-base-muted-foreground">
              익스텐션이 설치되어 있는지 확인해 주세요.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-base-primary px-6 py-2 font-medium text-white transition-colors hover:bg-base-primary/90"
            >
              다시 시도
            </button>
          </>
        )}
      </div>
    </div>
  );
}

"use client";

import { Button } from "@pickle/ui";
import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { logger } from "@/shared/lib/logger";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Global critical error", { error, digest: error.digest });
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="ko">
      <body className="bg-neutral-950 font-sans text-white">
        <div className="flex h-screen w-full flex-col items-center justify-center gap-6 px-4 text-center">
          <h1 className="font-bold text-[32px] leading-tight">
            시스템 오류가 발생했습니다 😢
          </h1>
          <p className="max-w-[400px] break-keep text-neutral-400">
            앱을 실행하는 도중 치명적인 오류가 발생했습니다. <br />
            불편을 드려 죄송합니다. 아래 버튼을 눌러 복구를 시도해주세요.
          </p>
          <div className="flex gap-4">
            <Button
              variant="secondary"
              size="h38"
              onClick={() => {
                window.location.href = "/";
              }}
            >
              홈으로 이동
            </Button>
            <Button variant="primary" size="h38" onClick={() => reset()}>
              복구 시도하기
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}

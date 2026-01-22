"use client";

import { ErrorView } from "@pickle/ui";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { logger } from "@/shared/lib/logger";

export default function PublicError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    logger.error("Public area runtime error", { error, digest: error.digest });
  }, [error]);

  return (
    <div className="effect-bg flex h-screen w-full items-center justify-center">
      <ErrorView
        title="페이지 로드 실패 😢"
        description={
          <>
            서비스 이용 중 문제가 발생했습니다. <br />
            입력하신 주소를 확인하거나 홈으로 돌아가주세요.
          </>
        }
        secondaryAction={{
          label: "이전 페이지로",
          onClick: () => router.back(),
        }}
        primaryAction={{
          label: "홈으로 돌아가기",
          onClick: () => router.push("/"),
          icon: "arrow_right_16",
          iconSide: "right",
        }}
      />
    </div>
  );
}

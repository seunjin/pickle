"use client";

import { ErrorView } from "@pickle/ui";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { logger } from "@/shared/lib/logger";

export default function ClientError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    logger.error("Client area runtime error", { error, digest: error.digest });
  }, [error]);

  return (
    <div className="flex h-full w-full items-center justify-center">
      <ErrorView
        title="데이터를 불러오지 못했습니다 😢"
        description={
          <>
            일시적인 오류가 발생했을 수 있습니다. <br />
            다시 시도 버튼을 누르거나 대시보드로 이동해주세요.
          </>
        }
        secondaryAction={{
          label: "대시보드로 가기",
          onClick: () => router.push("/dashboard"),
        }}
        primaryAction={{
          label: "다시 시도",
          onClick: () => reset(),
          icon: "arrow_right_16",
          iconSide: "right",
        }}
        fullHeight={false}
      />
    </div>
  );
}

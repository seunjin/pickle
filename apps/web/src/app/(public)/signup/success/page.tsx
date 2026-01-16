"use client";

import { Icon } from "@pickle/icons";
import { Button } from "@pickle/ui";
import { useEffect, useState } from "react";
import { PickleCausticGlass } from "@/shared/ui/PickleCausticGlass";

export default function SignupSuccessPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="relative w-full max-w-md">
        {/* 장식용 배경 효과 */}
        <div className="-top-12 -left-12 absolute size-48 animate-pulse rounded-full bg-base-primary/10 blur-3xl" />
        <div className="-bottom-12 -right-12 absolute size-48 animate-pulse rounded-full bg-base-primary/20 blur-3xl delay-700" />

        <PickleCausticGlass className="flex flex-col items-center gap-8 p-12 text-center">
          <div className="flex size-20 items-center justify-center rounded-full bg-base-primary/10 text-base-primary ring-4 ring-base-primary/5">
            <Icon name="check_circle_16" className="size-10" />
          </div>

          <div className="space-y-3">
            <h1 className="font-bold text-3xl text-base-content tracking-tight">
              환영합니다!
            </h1>
            <p className="text-base-content-secondary text-lg">
              Pickle Note 회원가입이 성공적으로 완료되었습니다.
              <br />
              이제 당신만의 스마트한 기록을 시작해보세요.
            </p>
          </div>

          <div className="w-full space-y-4">
            <Button
              className="h-12 w-full font-semibold text-lg"
              size="h38"
              onClick={() => {
                window.location.href = "/dashboard";
              }}
            >
              대시보드로 시작하기
              <Icon name="arrow_right_16" className="ml-2 size-5" />
            </Button>

            <p className="text-base-content-tertiary text-sm">
              자동으로 대시보드 연결을 준비하고 있습니다.
            </p>
          </div>
        </PickleCausticGlass>
      </div>
    </div>
  );
}

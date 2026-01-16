"use client";

import { Icon } from "@pickle/icons";
import { Button } from "@pickle/ui";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PickleCausticGlass } from "@/shared/ui/PickleCausticGlass";

export default function SignupErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || "알 수 없는 오류가 발생했습니다.";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="relative w-full max-w-md">
        <PickleCausticGlass className="flex flex-col items-center gap-8 border-red-500/20 p-12 text-center">
          <div className="flex size-20 items-center justify-center rounded-full bg-red-500/10 text-red-500 ring-4 ring-red-500/5">
            <Icon name="error_circle_16" className="size-10" />
          </div>

          <div className="space-y-3">
            <h1 className="font-bold text-2xl text-base-content tracking-tight">
              가입 처리에 실패했습니다
            </h1>
            <div className="break-all rounded-lg bg-base-surface/50 p-4 text-base-content-secondary text-sm">
              {error}
            </div>
          </div>

          <div className="w-full space-y-4">
            <Link href="/signup" className="block w-full">
              <Button
                variant="secondary"
                className="w-full py-6 font-semibold text-lg"
              >
                가입 페이지로 돌아가기
              </Button>
            </Link>

            <Link
              href="/signin"
              className="block text-base-content-secondary text-sm underline underline-offset-4 hover:text-base-primary"
            >
              이미 계정이 있으신가요? 로그인하기
            </Link>
          </div>
        </PickleCausticGlass>
      </div>
    </div>
  );
}

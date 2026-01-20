"use client";

import { Button, toast } from "@pickle/ui";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { logger } from "@/shared/lib/logger";
import { createClient } from "@/shared/lib/supabase/client";

export default function SignupErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || "알 수 없는 에러가 발생했습니다.";
  const supabase = createClient();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleLogin = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/api/internal/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (authError) throw authError;
    } catch (err) {
      logger.error("Login failed", { error: err });
      toast.error({
        title: "로그인 실패",
        description: "Google 인증에 실패했습니다. 다시 시도해 주세요.",
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="effect-bg flex h-full min-h-dvh flex-col items-center justify-center py-10">
      <div className="mb-3">
        <img src="/user-error.svg" alt="" />
      </div>
      <h1 className="mb-3 font-bold text-[28px] text-white leading-[1.3]">
        회원가입에 실패했어요!
      </h1>
      <p className="mb-10 w-[320px] text-center text-[16px] text-base-muted-foreground leading-[1.3]">
        {error}
      </p>
      <div className="flex gap-2">
        <Button
          onClick={handleLogin}
          disabled={isProcessing}
          className="w-42"
          variant="secondary"
        >
          다른 계정으로 로그인
        </Button>
        <Link href="/signup">
          <Button className="w-42">회원가입</Button>
        </Link>
      </div>
    </div>
  );
}

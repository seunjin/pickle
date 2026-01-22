"use client";

import { Button } from "@pickle/ui";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/shared/lib/supabase/client";

export default function NotFound() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    checkAuth();
  }, []);

  return (
    <div className="effect-bg flex h-screen w-full flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center text-center">
        <h1 className="mb-3 font-bold text-[28px] text-white leading-[1.3]">
          PAGE NOTE FOUND 😢
        </h1>
        <p className="mb-10 max-w-[320px] break-keep text-base text-neutral-300 leading-[1.3]">
          이런..페이지를 찾을 수 없습니다.
          <br />
          입력하신 주소를 다시 확인해주세요.
        </p>

        {isLoggedIn !== null && (
          <div className="flex w-[332px] gap-3">
            {isLoggedIn ? (
              <>
                <Button
                  variant="secondary"
                  size="h38"
                  className="flex-1 text-neutral-500"
                  onClick={() => router.back()}
                >
                  이전 페이지로
                </Button>
                <Button
                  size="h38"
                  variant="primary"
                  className="flex-1"
                  onClick={() => router.push("/dashboard")}
                  icon="arrow_right_16"
                  iconSide="right"
                >
                  피클로 돌아가기
                </Button>
              </>
            ) : (
              <Button
                size="h38"
                variant="primary"
                className="flex-1"
                onClick={() => router.push("/")}
                icon="arrow_right_16"
                iconSide="right"
              >
                피클로 돌아가기
              </Button>
            )}
          </div>
        )}
      </div>

      <footer className="absolute bottom-8 text-neutral-400 text-xs">
        © 2026 Pickle Note. All rights reserved.
      </footer>
    </div>
  );
}

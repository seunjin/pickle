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
        {/* 404 전용 일러스트 */}
        <div className="relative mb-8">
          <img
            src="/nodata-search.svg" // 좀 더 범용적인 검색 아이콘 활용
            alt="404 Not Found"
            className="size-20 opacity-20 grayscale"
          />
          <span className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 font-bold text-[32px] text-base-primary tracking-tighter">
            404
          </span>
        </div>

        <h1 className="mb-3 font-bold text-[24px] text-base-foreground leading-tight">
          길을 잃으셨나요?
        </h1>
        <p className="mb-10 max-w-[320px] break-keep text-[16px] text-neutral-500 leading-relaxed">
          요청하신 페이지가 존재하지 않거나,
          <br />
          이동 또는 삭제되었을 수 있습니다.
        </p>

        {isLoggedIn !== null && (
          <div className="flex min-w-[200px] flex-col gap-3">
            {isLoggedIn ? (
              <Button
                size="h38"
                variant="primary"
                className="w-full"
                onClick={() => router.push("/dashboard")}
              >
                대시보드로 돌아가기
              </Button>
            ) : (
              <Button
                size="h38"
                variant="primary"
                className="w-full"
                onClick={() => router.push("/")}
              >
                홈으로 돌아가기
              </Button>
            )}
            <Button
              variant="secondary_line"
              size="h38"
              className="w-full text-neutral-500"
              onClick={() => router.back()}
            >
              이전 페이지로
            </Button>
          </div>
        )}
      </div>

      <footer className="absolute bottom-8 text-neutral-400 text-xs">
        © 2026 Pickle Note. All rights reserved.
      </footer>
    </div>
  );
}

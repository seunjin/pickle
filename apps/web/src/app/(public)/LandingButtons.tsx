"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useUser } from "@/features/auth/model/useUser";
import { createClient } from "@/shared/lib/supabase/client";

export const LandingButtons = () => {
  const { user, appUser, isLoading } = useUser();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    const redirectTo = new URL(
      "/api/internal/auth/callback",
      window.location.origin,
    );
    if (next) {
      redirectTo.searchParams.set("next", next);
    }

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectTo.toString(),
      },
    });
  };

  if (isLoading) {
    return <div className="h-12 w-40 animate-pulse rounded-full bg-gray-200" />;
  }

  // 1. Not Authenticated -> Login
  if (!user) {
    return (
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isLoggingIn}
        className="flex h-12 items-center justify-center rounded-full bg-black px-8 font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
      >
        {isLoggingIn ? "연결 중..." : "Google로 시작하기"}
      </button>
    );
  }

  // 2. Authenticated but Pending (Needs Signup)
  if (appUser?.status === "pending") {
    return (
      <Link
        href={next ? `/signup?next=${next}` : "/signup"}
        className="flex h-12 items-center justify-center rounded-full bg-indigo-600 px-8 font-medium text-white transition-colors hover:bg-indigo-700"
      >
        회원가입 완료하기
      </Link>
    );
  }

  // 3. Active -> Dashboard (or Next)
  return (
    <Link
      href={next || "/dashboard"}
      className="flex h-12 items-center justify-center rounded-full bg-black px-8 font-medium text-white transition-colors hover:bg-gray-800"
    >
      {next ? "계속하기" : "대시보드로 이동"}
    </Link>
  );
};

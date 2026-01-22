import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerAuth } from "@/features/auth/api/getServerAuth";
import { GoogleAuthButton } from "@/features/auth/ui/GoogleAuthButton";
import { LandingAuthHandler } from "../LandingAuthHandler";

export const metadata: Metadata = {
  title: "로그인 | Pickle",
  description: "Pickle에 로그인하고 아이디어를 정리하세요.",
};

export default async function SigninPage(props: {
  searchParams: Promise<{ next?: string }>;
}) {
  const searchParams = await props.searchParams;
  const next = searchParams?.next;

  const { user, appUser } = await getServerAuth();

  // 로그인 상태라면 적절한 페이지로 리다이렉트
  if (user) {
    if (appUser && appUser.status === "active") {
      redirect(next || "/dashboard");
    } else {
      // 가입 절차가 남은 경우
      redirect("/signup");
    }
  }

  return (
    <div className="effect-bg grid min-h-dvh grid-rows-[1fr_auto] py-10">
      <LandingAuthHandler />
      <div className="flex flex-1 flex-col items-center justify-center pb-8">
        <div className="flex flex-col gap-6 pb-15 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-[10px] bg-green-400">
            <img
              src="/symbol-black.svg"
              alt="pickle symbol"
              className="w-[22.65px]"
            />
          </div>
          <h1 className="font-bold text-[28px] leading-[1.3]">로그인</h1>
          <p className="text-[16px] text-gray-300 leading-[1.3]">
            한 번 보고 지나쳤던 아이디어를 한 곳에 모아두고
            <br />
            언제든 쉽게 찾아보세요💡
          </p>
        </div>

        <div className="pb-7.5">
          <GoogleAuthButton next={next} label="Google로 로그인" />
        </div>

        <div className="flex items-center gap-[5px]">
          <span className="text-[14px] text-gray-500 leading-none">
            아직 계정이 없으신가요?
          </span>
          <Link
            href="/signup"
            className="font-medium text-[14px] text-base-muted-foreground leading-none transition-colors hover:text-base-primary"
          >
            회원가입
          </Link>
        </div>
      </div>
      <footer className="text-center text-gray-500 text-sm">
        © 2026 Pickle. All rights reserved.
      </footer>
    </div>
  );
}

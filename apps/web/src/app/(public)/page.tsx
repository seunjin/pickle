import { PickleCausticGlass } from "@pickle/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { getServerAuth } from "@/features/auth/api/getServerAuth";
import { LandingButton } from "@/features/auth/ui/LandingButton";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Pickle",
  description: "Web의 모든 것을 캡처하고 정리하세요.",
};

export default async function Home() {
  const { user, appUser } = await getServerAuth();
  const isActive = user && appUser?.status === "active";
  const isPending = user && appUser?.status === "pending";

  return (
    <div className="effect-bg grid min-h-dvh grid-rows-[1fr_auto] px-6 py-10">
      <div className="flex flex-col items-center justify-center pb-20">
        <div className="flex flex-col gap-6 pb-15 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-[10px] bg-green-400">
            <img
              src="/symbol-black.svg"
              alt="pickle symbol"
              className="w-[22.65px]"
            />
          </div>
          <h1 className="font-bold text-[40px] leading-[1.1] md:text-[56px]">
            웹의 모든 조각을 <br />
            하나의 <span className="text-shine">피클</span>로.
          </h1>
          <p className="text-[18px] text-gray-300 leading-[1.4] md:text-[20px]">
            흩어져 있는 아이디어와 캡처를 한 곳에 모으고
            <br className="hidden md:block" />
            당신만의 지식 베이스를 구축하세요.
          </p>
        </div>

        <div className="flex w-full max-w-[480px] flex-col gap-4">
          {isActive ? (
            <div className="flex flex-col items-center gap-3">
              <LandingButton initialIsActive={true} />
              <Link
                href="/extension"
                className="font-medium text-[14px] text-base-muted-foreground transition-colors hover:text-base-primary"
              >
                익스텐션 설치 안내
              </Link>
            </div>
          ) : (
            <PickleCausticGlass className="w-full">
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                {isPending ? (
                  <>
                    <h3 className="font-bold text-xl">가입을 완료해 주세요</h3>
                    <p className="text-neutral-400 text-sm">
                      약관 동의만 마치면 바로 피클을 사용할 수 있습니다.
                    </p>
                    <Link
                      href={`${process.env.NEXT_PUBLIC_APP_URL}/signup`}
                      className="flex h-12 w-full items-center justify-center rounded-full bg-base-primary font-bold text-black transition-opacity hover:opacity-90"
                    >
                      가입 완료하기
                    </Link>
                    <Link
                      href="/extension"
                      className="font-medium text-[14px] text-base-muted-foreground transition-colors hover:text-base-primary"
                    >
                      익스텐션 설치 안내
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href={`${process.env.NEXT_PUBLIC_APP_URL}/signup`}
                      className="flex h-12 w-full items-center justify-center rounded-full bg-base-primary font-bold text-black transition-opacity hover:opacity-90"
                    >
                      무료로 시작하기
                    </Link>
                    <Link
                      href="/extension"
                      className="font-medium text-[14px] text-base-muted-foreground transition-colors hover:text-base-primary"
                    >
                      익스텐션 설치 안내
                    </Link>
                    <div className="flex items-center gap-[5px] text-neutral-500 text-sm">
                      <span className="text-[14px] text-gray-500 leading-none">
                        이미 계정이 있으신가요?
                      </span>
                      <Link
                        href={`${process.env.NEXT_PUBLIC_APP_URL}/signin`}
                        className="font-medium text-[14px] text-base-muted-foreground leading-none transition-colors hover:text-base-primary"
                      >
                        로그인하기
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </PickleCausticGlass>
          )}
        </div>
      </div>

      <footer className="text-center text-gray-500 text-sm">
        © 2026 Pickle. All rights reserved.
      </footer>
    </div>
  );
}

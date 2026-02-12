import { PickleCausticGlass } from "@pickle/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { getServerAuth } from "@/features/auth/api/getServerAuth";
import { LandingButton } from "@/features/auth/ui/LandingButton";
import { BetaApplicationForm } from "@/features/beta-application/ui/BetaApplicationForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Pickle",
  description: "Web의 모든 것을 캡처하고 정리하세요.",
};

export default async function Home() {
  const { user, appUser, betaApplication } = await getServerAuth();
  const isActive = user && appUser?.status === "active";
  const isPending = user && appUser?.status === "pending";
  const hasApplied = !!betaApplication;

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
            하나의 피클로.
          </h1>
          <p className="text-[18px] text-gray-300 leading-[1.4] md:text-[20px]">
            흩어져 있는 아이디어와 캡처를 한 곳에 모으고
            <br className="hidden md:block" />
            당신만의 지식 베이스를 구축하세요.
          </p>
        </div>

        <div className="flex w-full max-w-[480px] flex-col gap-4">
          {isActive ? (
            <div className="flex justify-center">
              <LandingButton
                initialIsActive={true}
                initialIsPending={false}
                initialHasApplied={hasApplied}
              />
            </div>
          ) : (
            <>
              {/* 이미 신청한 PENDING 유저에게는 폼 대신 상태 메시지 노출 */}
              {isPending && hasApplied ? (
                <PickleCausticGlass className="w-full">
                  <div className="flex flex-col items-center gap-4 py-4 text-center">
                    <div className="flex size-12 items-center justify-center rounded-full bg-green-500/20 font-bold text-2xl text-green-500">
                      ✓
                    </div>
                    <h3 className="font-bold text-xl">참여 신청 완료</h3>
                    <p className="text-center text-neutral-400 text-sm">
                      사용자님의 신청서를 소중히 검토하고 있습니다.
                      <br />
                      승인이 완료되면 이메일({user?.email})로 알림을
                      보내드릴게요!
                    </p>
                  </div>
                </PickleCausticGlass>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  {isPending && !hasApplied && (
                    <div className="mb-2 text-center">
                      <h3 className="font-bold text-white text-xl">
                        계정이 생성되었습니다!
                      </h3>
                      <p className="mt-1 text-gray-400 text-sm">
                        하지만 현재는 비공개 베타 기간입니다. 아래 신청서를
                        제출해 주시면 검토 후 즉시 승인해 드릴게요.
                      </p>
                    </div>
                  )}
                  <BetaApplicationForm />
                  {!user && (
                    <>
                      <div className="mt-2 flex items-center gap-[5px] text-neutral-500 text-sm">
                        <span className="text-[14px] text-gray-500 leading-none">
                          이미 권한이 있으신가요?
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
              )}
            </>
          )}
        </div>
      </div>

      <footer className="text-center text-gray-500 text-sm">
        © 2026 Pickle. All rights reserved.
      </footer>
    </div>
  );
}

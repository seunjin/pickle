"use client";

import { Icon } from "@pickle/icons";
import { Checkbox, useDialog } from "@pickle/ui";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { completeSignup } from "@/features/auth/api/completeSignup";
import { useUser } from "@/features/auth/model/useUser";
import { GoogleAuthButton } from "@/features/auth/ui/GoogleAuthButton";
import {
  TermsArgreementModal,
  type TermsType,
} from "@/features/layout/terms/TermsArgreementModal";
import { PageSpinner } from "@/features/note/ui/PageSpinner";
import { logger } from "@/shared/lib/logger";
import { PickleCausticGlass } from "@/shared/ui/PickleCausticGlass";

export default function SignupPageContent() {
  const { user, appUser, isLoading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const dialog = useDialog();

  const [isCompleting, setIsCompleting] = useState(false);
  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    marketing: false,
  });

  // 이미 활성화된 유저라면 리다이렉트
  useEffect(() => {
    if (!isLoading && appUser?.status === "active") {
      router.replace(next);
      return;
    }
  }, [isLoading, appUser, router, next]);

  const handleAgreementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setAgreements((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleAllAgreementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    setAgreements((prev) => ({
      ...prev,
      terms: checked,
      privacy: checked,
      marketing: checked,
    }));
  };

  const isAllAgreementsChecked =
    agreements.terms && agreements.privacy && agreements.marketing;

  const handleTermsModalOpen = (type: TermsType) => {
    dialog.open(() => (
      <TermsArgreementModal
        type={type}
        onAgree={() => {
          setAgreements((prev) => ({
            ...prev,
            [type]: true,
          }));
          dialog.close();
        }}
      />
    ));
  };

  // 로딩 중이거나 리다이렉트 중일 때 스켈레톤/로딩 표시
  if (isLoading || appUser?.status === "active") {
    return <PageSpinner />;
  }

  return (
    <div className="effect-bg grid min-h-dvh grid-rows-[1fr_auto] py-10">
      <div className="mx-auto flex w-100 flex-1 flex-col items-center justify-center pb-8">
        {/* 로고 */}
        <div className="pb-10">
          <img src="/pickle-with-logo.svg" alt="pickle-with-logo" />
        </div>
        <div className="flex flex-col items-center gap-7.5">
          {/* 회원가입 Card */}
          <PickleCausticGlass className="h-100 w-full">
            <div className="pb-11">
              <h1 className="pb-1 font-bold text-[22px] leading-[1.3]">
                Sign UP
              </h1>
              <p className="text-[15px] text-white/90 leading-[1.3]">
                피클 서비스의 원활한 이용을 위해 <br />
                약관에 동의해주세요.
              </p>
            </div>
            <div className="flex flex-col gap-3 pb-11">
              {/* 전체약관 동의 */}
              <div className="border-base-border-light border-b pb-2">
                <label
                  htmlFor="terms-all"
                  className="group inline-flex w-full cursor-pointer items-center gap-3"
                >
                  <Checkbox
                    id="terms-all"
                    name="terms-all"
                    checked={isAllAgreementsChecked}
                    onChange={handleAllAgreementChange}
                  />{" "}
                  <span className="text-[14px] text-base-foreground">
                    전체약관 동의
                  </span>
                </label>
              </div>

              {/* 이용약관 동의 */}
              <div className="flex items-center gap-3">
                <label
                  htmlFor="terms"
                  className="group inline-flex flex-1 cursor-pointer items-center gap-3"
                >
                  <Checkbox
                    id="terms"
                    name="terms"
                    checked={agreements.terms}
                    onChange={handleAgreementChange}
                  />{" "}
                  <span className="inline-flex items-center gap-1 text-[14px]">
                    <strong className="font-normal text-base-primary">
                      [필수]
                    </strong>{" "}
                    서비스 이용약관 동의
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => handleTermsModalOpen("terms")}
                  className="text-neutral-600 transition-colors hover:text-base-muted"
                >
                  <Icon name="arrow_right_16" className="text-inherit" />
                </button>
              </div>

              {/* 개인정보 수집 및 이용 동의 */}
              <div className="flex items-center gap-3">
                <label
                  htmlFor="privacy"
                  className="group inline-flex flex-1 cursor-pointer items-center gap-3"
                >
                  <Checkbox
                    id="privacy"
                    name="privacy"
                    checked={agreements.privacy}
                    onChange={handleAgreementChange}
                  />{" "}
                  <span className="inline-flex items-center gap-1 text-[14px]">
                    <strong className="font-normal text-base-primary">
                      [필수]
                    </strong>{" "}
                    개인정보 수집 및 이용 동의
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => handleTermsModalOpen("privacy")}
                  className="text-neutral-600 transition-colors hover:text-base-muted"
                >
                  <Icon name="arrow_right_16" className="text-inherit" />
                </button>
              </div>

              {/* 마케팅 정보 수신 동의 */}
              <div className="flex items-center gap-3">
                <label
                  htmlFor="marketing"
                  className="group inline-flex flex-1 cursor-pointer items-center gap-3"
                >
                  <Checkbox
                    id="marketing"
                    name="marketing"
                    checked={agreements.marketing}
                    onChange={handleAgreementChange}
                  />{" "}
                  <span className="inline-flex items-center gap-1 text-[14px]">
                    <strong className="font-normal text-base-muted">
                      [선택]
                    </strong>{" "}
                    마케팅 정보 수신 동의
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => handleTermsModalOpen("marketing")}
                  className="text-neutral-600 transition-colors hover:text-base-muted"
                >
                  <Icon name="arrow_right_16" className="text-inherit" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <GoogleAuthButton
                next={next}
                label="Google로 회원가입"
                disabled={
                  isCompleting || !agreements.terms || !agreements.privacy
                }
                onClick={
                  user && (!appUser || appUser.status === "pending")
                    ? async () => {
                        try {
                          setIsCompleting(true);
                          await completeSignup({
                            marketing_agreed: agreements.marketing,
                          });

                          // 성공 시 대시보드로 이동
                          router.push("/dashboard");
                        } catch (error) {
                          // 실패 시 전용 에러 페이지로 이동
                          router.push(
                            `/signup/error?error=${encodeURIComponent(String(error))}`,
                          );
                          logger.error("Signup completion failed", { error });
                          setIsCompleting(false);
                        }
                      }
                    : undefined
                }
                options={{
                  data: {
                    is_terms_agreed: agreements.terms,
                    is_privacy_agreed: agreements.privacy,
                    is_marketing_agreed: agreements.marketing,
                  },
                }}
              />
            </div>
          </PickleCausticGlass>

          <div className="flex items-center gap-[5px]">
            <span className="text-[14px] text-gray-500 leading-none">
              이미 계정이 있으신가요?
            </span>
            <Link
              href="/signin"
              className="font-medium text-[14px] text-base-muted-foreground leading-none transition-colors hover:text-base-primary"
            >
              로그인
            </Link>
          </div>
        </div>
      </div>
      <footer className="text-center text-gray-500 text-sm">
        © 2026 Pickle. All rights reserved.
      </footer>
    </div>
  );
}

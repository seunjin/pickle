import { Icon } from "@pickle/icons";
import { Checkbox, useDialog } from "@pickle/ui";
import {
  createFileRoute,
  Link,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { completeSignup } from "@/features/auth/api/completeSignup";
import { getBetaApplication } from "@/features/auth/api/getBetaApplication";
import { useUser } from "@/features/auth/model/useUser";
import { GoogleAuthButton } from "@/features/auth/ui/GoogleAuthButton";
import {
  TermsArgreementModal,
  type TermsType,
} from "@/features/layout/terms/TermsArgreementModal";
import { PageSpinner } from "@/features/note/ui/PageSpinner";
import { logger } from "@/shared/lib/logger";
import { PickleCausticGlass } from "@/shared/ui/PickleCausticGlass";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

function SignupPage() {
  const { user, appUser, isLoading, refreshAppUser } = useUser();
  const navigate = useNavigate();
  const searchParams = useSearch({ from: "/signup" }) as { next?: string };
  const next = searchParams.next || "/";
  const dialog = useDialog();

  const [isCompleting, setIsCompleting] = useState(false);
  const [isOver14, setIsOver14] = useState(false);
  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    marketing: false,
  });

  const [betaApplication, setBetaApplication] = useState<any>(null);
  const [isCheckingApplication, setIsCheckingApplication] = useState(false);

  // 이미 활성화된 유저라면 리다이렉트
  useEffect(() => {
    if (!isLoading && appUser?.status === "active") {
      navigate({ to: next, replace: true });
      return;
    }

    // 펜딩 상태일 때 베타 신청 여부 확인
    if (!isLoading && user?.email && appUser?.status === "pending") {
      const checkApplication = async () => {
        setIsCheckingApplication(true);
        const data = await getBetaApplication(user.email!);
        setBetaApplication(data);
        setIsCheckingApplication(false);
      };
      checkApplication();
    }
  }, [isLoading, appUser, navigate, next, user?.email]);

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

  if (isLoading || appUser?.status === "active") {
    return <PageSpinner />;
  }

  if (appUser?.status === "pending") {
    const hasApplied = !!betaApplication;
    const wwwUrl = import.meta.env.VITE_WWW_URL || "https://pic-kle.io/";

    return (
      <div className="effect-bg grid min-h-dvh grid-rows-[1fr_auto] py-10">
        <div className="mx-auto flex w-100 flex-1 flex-col items-center justify-center pb-8">
          <div className="pb-10">
            <img src="/pickle-with-logo.svg" alt="pickle-with-logo" />
          </div>
          <PickleCausticGlass className="w-full text-center">
            <div className="pb-6">
              <Icon
                name="notice_16"
                className="mx-auto mb-4 size-10 text-base-primary"
              />
              <h1 className="pb-2 font-bold text-[22px] leading-[1.3]">
                {hasApplied ? "Beta Approval Pending" : "Beta Access Required"}
              </h1>
              <p className="text-[15px] text-white/90 leading-relaxed">
                {hasApplied ? (
                  <>
                    피클 오픈 베타에 신청해 주셔서 감사합니다!
                    <br />
                    현재 승인 대기 중이며, 관리자의 승인이 완료된 후
                    <br />
                    서비스를 정상적으로 이용하실 수 있습니다.
                  </>
                ) : (
                  <>
                    피클은 현재 클로즈드 베타 기간입니다.
                    <br />
                    서비스를 이용하시려면 먼저 베타 참여 신청이 필요합니다.
                    <br />
                    아래 버튼을 눌러 신청서를 제출해 주세요!
                  </>
                )}
              </p>
            </div>
            <div className="mt-4 flex flex-col gap-3">
              {hasApplied ? (
                <button
                  type="button"
                  onClick={() => refreshAppUser()}
                  className="flex h-12 w-full items-center justify-center rounded-full bg-base-primary font-bold text-black transition-opacity hover:opacity-90"
                >
                  승인 상태 확인하기
                </button>
              ) : (
                <a
                  href={wwwUrl}
                  className="flex h-12 w-full items-center justify-center rounded-full bg-base-primary font-bold text-black transition-opacity hover:opacity-90"
                >
                  베타 참여 신청하러 가기
                </a>
              )}
              <button
                type="button"
                onClick={async () => {
                  const { createClient } = await import(
                    "@/shared/lib/supabase"
                  );
                  await createClient().auth.signOut();
                  navigate({ to: "/signin", replace: true });
                }}
                className="text-gray-400 text-sm hover:underline"
              >
                다른 계정으로 로그인하기
              </button>
            </div>
          </PickleCausticGlass>
        </div>
        <footer className="text-center text-gray-500 text-sm">
          © 2026 Pickle. All rights reserved.
        </footer>
      </div>
    );
  }

  return (
    <div className="effect-bg grid min-h-dvh grid-rows-[1fr_auto] py-10">
      <div className="mx-auto flex w-100 flex-1 flex-col items-center justify-center pb-8">
        <div className="pb-10">
          <img src="/pickle-with-logo.svg" alt="pickle-with-logo" />
        </div>
        <div className="flex flex-col items-center gap-7.5">
          <PickleCausticGlass className="w-full">
            <div className="pb-11">
              <h1 className="pb-1 font-bold text-[22px] leading-[1.3]">
                Sign UP
              </h1>
              <p className="text-[15px] text-white/90 leading-[1.3]">
                피클 서비스의 원활한 이용을 위해 <br />
                약관에 동의해주세요.
              </p>
            </div>

            <div className="flex flex-col gap-3 pb-7.5">
              <div className="border-base-border-light border-b pb-2">
                <label
                  htmlFor="is-over-14-check"
                  className="group inline-flex w-full cursor-pointer items-center gap-3"
                >
                  <Checkbox
                    id="is-over-14-check"
                    name="is-over-14-check"
                    checked={isOver14}
                    onChange={(e) => setIsOver14(e.target.checked)}
                  />{" "}
                  <span className="text-[14px] text-base-foreground">
                    이용 자격 확인
                  </span>
                </label>
              </div>

              <div className="flex items-center gap-3">
                <div className="size-4" />
                <span className="inline-flex items-center gap-1 text-[14px]">
                  <strong className="font-normal text-base-primary">
                    [필수]
                  </strong>{" "}
                  본인은 만 14세 이상입니다.
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 pb-11">
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
            <div className="flex w-[340px] items-center gap-3">
              <GoogleAuthButton
                next={next}
                label="Google로 회원가입"
                disabled={
                  isCompleting ||
                  !isOver14 ||
                  !agreements.terms ||
                  !agreements.privacy
                }
                onClick={
                  user && (!appUser || (appUser.status as string) === "pending")
                    ? async () => {
                        try {
                          setIsCompleting(true);
                          const response = await completeSignup({
                            marketing_agreed: agreements.marketing,
                            is_over_14: isOver14,
                          });

                          if ((response.status as string) === "pending") {
                            await refreshAppUser();
                            setIsCompleting(false);
                            return;
                          }

                          navigate({ to: "/", replace: true });
                        } catch (error: unknown) {
                          const errorMessage =
                            error instanceof Error
                              ? error.message
                              : String(error);

                          if (errorMessage.includes("AUTH_USER_NOT_FOUND")) {
                            logger.warn(
                              "Session invalid (user not found in DB). Forcing sign out.",
                            );
                            const { createClient } = await import(
                              "@/shared/lib/supabase"
                            );
                            const supabase = createClient();
                            await supabase.auth.signOut();
                            navigate({
                              to: "/signin",
                              search: { reason: "session_expired" },
                              replace: true,
                            });
                            return;
                          }

                          navigate({
                            to: "/signup",
                            search: { error: errorMessage },
                            replace: true,
                          });
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
                    is_over_14: isOver14,
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
              to="/signin"
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

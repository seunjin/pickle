"use client";

import { Icon } from "@pickle/icons";
import { ActionButton, Button, Checkbox } from "@pickle/ui";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useUser } from "@/features/auth/model/useUser";
import { GoogleLoginButton } from "@/features/auth/ui/GoogleLoginButton";
export default function SignupPageContent() {
  const { user, appUser, isLoading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    marketing: false,
  });

  // 이미 활성화된 유저라면 리다이렉트
  if (!isLoading && appUser?.status === "active") {
    router.replace(next);
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="effect-bg grid min-h-dvh grid-rows-[1fr_auto] py-10">
      <div className="mx-auto flex w-100 flex-1 flex-col items-center justify-center pb-8">
        {/* 로고 */}
        <div className="pb-10">
          <img src="/pickle-with-logo.svg" alt="pickle-with-logo" />
        </div>
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
                <Checkbox id="terms-all" /> <span>전체약관 동의</span>
              </label>
            </div>

            {/* 이용약관 동의 */}
            <div className="flex items-center gap-3">
              <label
                htmlFor="terms"
                className="group inline-flex flex-1 cursor-pointer items-center gap-3"
              >
                <Checkbox id="terms" />{" "}
                <span className="inline-flex items-center gap-1 text-[14px]">
                  <strong className="font-normal text-base-primary">
                    [필수]
                  </strong>{" "}
                  서비스 이용약관 동의
                </span>
              </label>
              <button
                type="button"
                className="text-neutral-600 transition-colors hover:text-base-muted"
              >
                <Icon name="arrow_right_16" className="text-inherit" />
              </button>
            </div>

            {/* 개인정보 수집 및 이용 동의 */}
            <div className="flex items-center gap-3">
              <label
                htmlFor="terms2"
                className="group inline-flex flex-1 cursor-pointer items-center gap-3"
              >
                <Checkbox id="terms2" />{" "}
                <span className="inline-flex items-center gap-1 text-[14px]">
                  <strong className="font-normal text-base-primary">
                    [필수]
                  </strong>{" "}
                  개인정보 수집 및 이용 동의
                </span>
              </label>
              <button
                type="button"
                className="text-neutral-600 transition-colors hover:text-base-muted"
              >
                <Icon name="arrow_right_16" className="text-inherit" />
              </button>
            </div>

            {/* 마케팅 정보 수신 동의 */}
            <div className="flex items-center gap-3">
              <label
                htmlFor="terms3"
                className="group inline-flex flex-1 cursor-pointer items-center gap-3"
              >
                <Checkbox id="terms3" />{" "}
                <span className="inline-flex items-center gap-1 text-[14px]">
                  <strong className="font-normal text-base-muted">
                    [선택]
                  </strong>{" "}
                  마케팅 정보 수신 동의
                </span>
              </label>
              <button
                type="button"
                className="text-neutral-600 transition-colors hover:text-base-muted"
              >
                <Icon name="arrow_right_16" className="text-inherit" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <GoogleLoginButton disabled />
          </div>
        </PickleCausticGlass>
      </div>
      <footer className="text-center text-gray-500 text-sm">
        © 2026 Pickle. All rights reserved.
      </footer>
    </div>
    // <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
    //   <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
    //     <div className="text-center">
    //       <h1 className="font-bold text-3xl text-gray-900">환영합니다! 🎉</h1>
    //       <p className="mt-2 text-gray-600">
    //         서비스 이용을 위해 약관에 동의해주세요.
    //       </p>
    //     </div>

    //     <div className="space-y-4">
    //       <div className="rounded-lg border p-4">
    //         <label className="flex cursor-pointer items-start gap-3">
    //           <input
    //             type="checkbox"
    //             checked={agreements.terms}
    //             onChange={(e) =>
    //               setAgreements({...agreements, terms: e.target.checked })
    //             }
    //             className="mt-1 h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
    //           />
    //           <span className="text-gray-700 text-sm">
    //             <span className="font-semibold text-indigo-600">[필수]</span>{" "}
    //             서비스 이용약관 동의
    //           </span>
    //         </label>
    //       </div>

    //       <div className="rounded-lg border p-4">
    //         <label className="flex cursor-pointer items-start gap-3">
    //           <input
    //             type="checkbox"
    //             checked={agreements.privacy}
    //             onChange={(e) =>
    //               setAgreements({...agreements, privacy: e.target.checked })
    //             }
    //             className="mt-1 h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
    //           />
    //           <span className="text-gray-700 text-sm">
    //             <span className="font-semibold text-indigo-600">[필수]</span>{" "}
    //             개인정보 수집 및 동의
    //           </span>
    //         </label>
    //       </div>

    //       <div className="rounded-lg border p-4">
    //         <label className="flex cursor-pointer items-start gap-3">
    //           <input
    //             type="checkbox"
    //             checked={agreements.marketing}
    //             onChange={(e) =>
    //               setAgreements({...agreements, marketing: e.target.checked })
    //             }
    //             className="mt-1 h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
    //           />
    //           <span className="text-gray-700 text-sm">
    //             <span className="text-gray-500">[선택]</span> 마케팅 정보 수신
    //             동의
    //           </span>
    //         </label>
    //       </div>
    //     </div>

    //     <div className="pt-4">
    //       <GoogleLoginButton
    //         next={next}
    //         label="동의하고 시작하기"
    //         disabled={!agreements.terms || !agreements.privacy}
    //         options={{
    //           data: {
    //             is_terms_agreed: agreements.terms,
    //             is_privacy_agreed: agreements.privacy,
    //             is_marketing_agreed: agreements.marketing,
    //           },
    //         }}
    //       />
    //       {!agreements.terms || !agreements.privacy ? (
    //         <p className="mt-2 text-center text-[12px] text-red-500">
    //           필수 약관에 모두 동의해주세요.
    //         </p>
    //       ) : null}
    //     </div>
    //   </div>
    // </div>
  );
}

interface Props {
  children?: React.ReactNode;
  className?: string;
}

const PickleCausticGlass = ({ children, className = "" }: Props) => {
  return (
    <div className={`group/glass relative isolate ${className}`}>
      {/* 1. 베이스 (Deep & Dark) */}
      <div className="absolute inset-0 overflow-hidden rounded-[20px] bg-neutral-950/5 backdrop-blur-xl" />

      {/* 2. 빛의 맺힘 (Internal Reflection) */}
      {/* 5시 방향 내부 반사광은 그대로 유지 (반응 좋으셨던 부분) */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[20px]"
        style={{
          boxShadow: `
            inset -10px -10px 30px -5px rgba(255, 255, 255, 0.1),
            inset -2px -2px 5px 0px rgba(255, 255, 255, 0.01)
          `,
        }}
      />

      {/* 3. 엣지 하이라이트 (수정됨!) */}
      {/* 1시와 7시는 아예 투명하게 날려버림 */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[20px]"
        style={{
          padding: "0.5px",
          background: `linear-gradient(135deg, 
              rgba(255,255,255,0.1) 0%,   /* 11시: 선명한 빛 시작 */
              rgba(255,255,255,0.1) 20%,  /* 11시: 서서히 흐려짐 */
              rgba(255,255,255,0) 25%,    /* [CUT] 1시/7시 구간 시작: 완전 투명 */
              rgba(255,255,255,0) 75%,    /* [CUT] 1시/7시 구간 끝: 완전 투명 */
              rgba(255,255,255,0.1) 80%,  /* 5시: 다시 은은하게 빛남 */
              rgba(255,255,255,0.15) 100% /* 5시: 끝맺음 */
            )`,
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />

      {/* 4. 상단 컷팅 라인 (11시 강조용) */}
      {/* 11시 쪽에만 아주 얇은 1px 라인을 추가해서 밀도를 높임 */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[20px] opacity-80"
        style={{
          boxShadow: "inset 1px 1px 0px 0px rgba(255,255,255,0.2)",
        }}
      />

      {/* 컨텐츠 */}
      <div className="relative z-10 h-full p-6 text-white/90">{children}</div>
    </div>
  );
};

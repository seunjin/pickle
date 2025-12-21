"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@/features/auth/model/useUser";
import { createClient } from "@/shared/lib/supabase/client";

export default function SignupPageContent() {
  const { user, appUser, isLoading, refreshAppUser } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  const supabase = createClient();
  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    marketing: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if guest or already active
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace("/");
      } else if (appUser?.status === "active") {
        router.replace(next);
      }
    }
  }, [user, appUser, isLoading, router, next]);

  const handleSignup = async () => {
    if (!agreements.terms || !agreements.privacy) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase.rpc("complete_signup", {
        marketing_agreed: agreements.marketing,
      });

      if (error) throw error;

      // Refresh app user to update status locally
      await refreshAppUser();
      router.replace(next);
    } catch (error) {
      console.error("Signup failed:", error);
      alert("회원가입 처리 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !user || appUser?.status === "active") {
    // Show loading or nothing while redirecting
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
        <div className="text-center">
          <h1 className="font-bold text-3xl text-gray-900">환영합니다! 🎉</h1>
          <p className="mt-2 text-gray-600">
            서비스 이용을 위해 약관에 동의해주세요.
          </p>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={agreements.terms}
                onChange={(e) =>
                  setAgreements({ ...agreements, terms: e.target.checked })
                }
                className="mt-1 h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-gray-700 text-sm">
                <span className="font-semibold text-indigo-600">[필수]</span>{" "}
                서비스 이용약관 동의
              </span>
            </label>
          </div>

          <div className="rounded-lg border p-4">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={agreements.privacy}
                onChange={(e) =>
                  setAgreements({ ...agreements, privacy: e.target.checked })
                }
                className="mt-1 h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-gray-700 text-sm">
                <span className="font-semibold text-indigo-600">[필수]</span>{" "}
                개인정보 수집 및 동의
              </span>
            </label>
          </div>

          <div className="rounded-lg border p-4">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={agreements.marketing}
                onChange={(e) =>
                  setAgreements({ ...agreements, marketing: e.target.checked })
                }
                className="mt-1 h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-gray-700 text-sm">
                <span className="text-gray-500">[선택]</span> 마케팅 정보 수신
                동의
              </span>
            </label>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSignup}
          disabled={!agreements.terms || !agreements.privacy || isSubmitting}
          className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-indigo-700 disabled:bg-gray-400"
        >
          {isSubmitting ? "처리 중..." : "동의하고 시작하기"}
        </button>
      </div>
    </div>
  );
}

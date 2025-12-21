import type { AppUser } from "@pickle/contracts";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { GoogleLoginButton } from "@/features/auth/ui/GoogleLoginButton";

interface LandingButtonsProps {
  next?: string;
  initialUser?: User | null;
  initialAppUser?: AppUser | null;
}

/**
 * 랜딩 페이지의 핵심 액션 버튼들을 표시하는 서버 컴포넌트입니다.
 * 서버에서 유저 데이터를 직접 받아 렌더링하므로 레이아웃 시프트가 전혀 없습니다.
 */
export const LandingButtons = ({
  next,
  initialUser,
  initialAppUser,
}: LandingButtonsProps) => {
  // 1. 로그인하지 않은 상태
  if (!initialUser) {
    return <GoogleLoginButton next={next} />;
  }

  // 2. 인증은 되었으나 회원가입 절차가 남은 상태
  if (initialAppUser?.status === "pending") {
    return (
      <Link
        href={next ? `/signup?next=${next}` : "/signup"}
        className="flex h-12 items-center justify-center rounded-full bg-indigo-600 px-8 font-semibold text-white shadow-indigo-200 shadow-lg transition-all hover:bg-indigo-700 hover:shadow-indigo-300 active:scale-95"
      >
        회원가입 완료하기
      </Link>
    );
  }

  // 3. 활성화된 유저 -> 대시보드 혹은 다음 페이지로 이동
  return (
    <Link
      href={next || "/dashboard"}
      className="flex h-12 items-center justify-center rounded-full bg-gray-900 px-8 font-semibold text-white shadow-lg transition-all hover:bg-black hover:shadow-xl active:scale-95"
    >
      {next ? "계속하기" : "대시보드로 이동"}
    </Link>
  );
};

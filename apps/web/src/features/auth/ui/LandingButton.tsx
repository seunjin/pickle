"use client";

import Link from "next/link";
import { useSessionContext } from "@/features/auth/model/SessionContext";

/**
 * 랜딩 페이지의 메인 버튼 (클라이언트 컴포넌트)
 *
 * 서버 사이드 캐싱과 관계없이 클라이언트의 실제 세션 상태를 실시간으로 반영합니다.
 * initialIsActive를 통해 하이드레이션 이전의 초기 상태를 렌더링하고,
 * 이후 클라이언트 세션이 로드되면 최신 상태로 갱신합니다.
 */
export function LandingButton({
  initialIsActive,
}: {
  initialIsActive: boolean;
  initialIsPending: boolean;
  initialHasApplied: boolean;
}) {
  const { user, appUser, isLoading } = useSessionContext();

  const isUserLoggedIn = !!user;
  const isActive = isLoading
    ? initialIsActive
    : isUserLoggedIn && appUser?.status === "active";

  if (!isActive) return null;

  return (
    <Link
      href={`${process.env.NEXT_PUBLIC_APP_URL}/`}
      className="flex h-[48px] min-w-[200px] items-center justify-center rounded-[8px] bg-base-primary font-bold text-[16px] text-black transition-opacity hover:opacity-90"
    >
      대시보드로 이동
    </Link>
  );
}

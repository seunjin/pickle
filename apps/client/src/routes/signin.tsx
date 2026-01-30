import { Icon } from "@pickle/icons";
import { useDialog } from "@pickle/ui";
import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect } from "react";
import { useUser } from "@/features/auth/model/useUser";
import { GoogleAuthButton } from "@/features/auth/ui/GoogleAuthButton";
import { PageSpinner } from "@/features/note/ui/PageSpinner";
import { PickleCausticGlass } from "@/shared/ui/PickleCausticGlass";

export const Route = createFileRoute('/signin')({
    component: SigninPage,
})

function SigninPage() {
    const { user, appUser, isLoading } = useUser();
    const navigate = useNavigate();
    const searchParams = useSearch({ from: '/signin' }) as { next?: string; reason?: string };
    const next = searchParams.next || "/";

    // 이미 로그인되어 있고 활성화된 유저라면 대시보드로 이동
    useEffect(() => {
        if (!isLoading && user && appUser?.status === "active") {
            navigate({ to: next, replace: true });
        }
    }, [isLoading, user, appUser, navigate, next]);

    if (isLoading || (user && appUser?.status === "active")) {
        return <PageSpinner />;
    }

    return (
        <div className="effect-bg grid min-h-dvh grid-rows-[1fr_auto] py-10">
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

                <div className="w-[340px] pb-7.5">
                    {searchParams.reason === 'no_profile' && (
                        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800 text-sm">
                            <p className="font-semibold">사용자 프로필을 찾을 수 없습니다.</p>
                            <p>가입 절차가 완료되지 않았거나 프로필 정보가 없습니다. 서비스 이용을 위해 회원가입을 먼저 진행해 주세요.</p>
                        </div>
                    )}
                    <GoogleAuthButton next={next} label="Google로 로그인" />
                </div>

                <div className="flex items-center gap-[5px]">
                    <span className="text-[14px] text-gray-500 leading-none">
                        아직 계정이 없으신가요?
                    </span>
                    <Link
                        to="/signup"
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

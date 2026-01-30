import { Icon } from "@pickle/icons";
import { Link, createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
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
                    <h1 className="font-bold text-[28px] leading-[1.3]">Admin 로그인</h1>
                    <p className="text-[16px] text-gray-300 leading-[1.3]">
                        관리자 계정으로 로그인해 주세요.
                    </p>
                </div>

                <div className="pb-7.5 w-[340px]">
                    <GoogleAuthButton next={next} label="Google로 로그인" />
                    {searchParams.reason === "session_expired" && (
                        <p className="mt-4 text-center text-[13px] text-red-500">
                            세션이 만료되었습니다. 다시 로그인해 주세요.
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-[5px]">
                    <span className="text-[14px] text-gray-500 leading-none">
                        계정이 없으신가요?
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
                © 2026 Pickle Admin. All rights reserved.
            </footer>
        </div>
    );
}

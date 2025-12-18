"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUser } from "@/features/auth/model/useUser";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, appUser, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // 1. Not logged in -> Go to Landing
      if (!user) {
        router.replace("/");
        return;
      }

      // 2. Logged in but Pending (Terms not agreed) -> Go to Signup
      if (appUser?.status === "pending") {
        router.replace("/signup");
        return;
      }

      // 3. Active -> Pass
    }
  }, [user, appUser, isLoading, router]);

  if (isLoading || !user || appUser?.status !== "active") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}

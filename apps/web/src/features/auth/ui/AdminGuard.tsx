"use client";

import { Spinner } from "@pickle/ui";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUser } from "@/features/auth/model/useUser";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, appUser, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace("/signin");
        return;
      }

      if (
        !appUser ||
        (appUser.authority !== "admin" && appUser.authority !== "super_admin")
      ) {
        router.replace("/");
        return;
      }
    }
  }, [user, appUser, isLoading, router]);

  if (
    isLoading ||
    !user ||
    (appUser?.authority !== "admin" && appUser?.authority !== "super_admin")
  ) {
    return (
      <div className="effect-bg flex min-h-screen items-center justify-center">
        <Spinner className="size-8 text-base-primary" />
      </div>
    );
  }

  return <>{children}</>;
}

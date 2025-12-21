"use client";

import type { AppUser } from "@pickle/contracts";
import { DialogProvider } from "@pickle/lib";
/**
 * 클라이언트 사이드 Provider들을 통합 관리합니다.
 * 계층 구조: Query -> Session -> Dialog
 * 이 순서를 통해 다이얼로그 내부에서도 서버 데이터와 인증 정보에 접근할 수 있습니다.
 */
import type { User } from "@supabase/supabase-js";
import type { ReactNode } from "react";
import { SessionProvider } from "@/features/auth";
import QueryProvider from "@/shared/providers/QueryProvider";

interface ClientProvidersProps {
  children: ReactNode;
  initialUser?: User | null;
  initialAppUser?: AppUser | null;
}

export function ClientProviders({
  children,
  initialUser,
  initialAppUser,
}: ClientProvidersProps) {
  return (
    <QueryProvider>
      <SessionProvider
        initialUser={initialUser}
        initialAppUser={initialAppUser}
      >
        <DialogProvider>{children}</DialogProvider>
      </SessionProvider>
    </QueryProvider>
  );
}

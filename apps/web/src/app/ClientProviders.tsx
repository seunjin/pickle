"use client";

import { DialogProvider } from "@pickle/lib";
import type { ReactNode } from "react";
import { SessionProvider } from "@/features/auth";
import QueryProvider from "@/shared/providers/QueryProvider";

/**
 * 클라이언트 사이드 Provider들을 통합 관리합니다.
 * 계층 구조: Query -> Session -> Dialog
 * 이 순서를 통해 다이얼로그 내부에서도 서버 데이터와 인증 정보에 접근할 수 있습니다.
 */
export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <SessionProvider>
        <DialogProvider>{children}</DialogProvider>
      </SessionProvider>
    </QueryProvider>
  );
}

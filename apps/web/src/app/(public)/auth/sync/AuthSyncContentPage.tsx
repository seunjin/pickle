"use client";

import { Button } from "@pickle/ui";
import { useEffect, useState } from "react";
import { GoogleAuthButton, useSessionContext } from "@/features/auth";
import { createClient } from "@/shared/lib/supabase/client";

/**
 * 이 페이지는 웹 애플리케이션의 인증 세션을 브라우저 익스텐션과 동기화하는 역할을 합니다.
 *
 * 동작 방식:
 * 1. 사용자가 익스텐션의 'Connect Account' 버튼을 클릭하여 이 페이지를 엽니다.
 * 2. 페이지 로드 시 현재 로그인된 사용자가 있는지 확인합니다.
 * 3. 로그인되어 있지 않다면 회원가입/로그인 페이지(/signup)로 리다이렉트합니다.
 * 4. 로그인되어 있다면 `supabase.auth.getSession()`을 통해 전체 세션 정보(토큰 포함)를 가져옵니다.
 * 5. `window.postMessage`를 사용하여 `PICKLE_SYNC_SESSION` 이벤트를 발생시킵니다.
 * 6. 익스텐션의 Content Script가 이 메시지를 수신하여 `chrome.storage.local`에 세션을 저장합니다.
 */
export default function AuthSyncPageContent() {
  const { user, isLoading } = useSessionContext();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [countdown, setCountdown] = useState(3);

  const supabase = createClient();

  // Direct Login Handler
  const _handleLogin = async () => {
    // Redirect back to this sync page after login
    const redirectTo = new URL(
      "/api/internal/auth/callback",
      window.location.origin,
    );
    redirectTo.searchParams.set("next", "/auth/sync");

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectTo.toString(),
      },
    });
  };

  // 세션 브로드캐스트 (Retry & ACK Logic)
  useEffect(() => {
    if (user && !isLoading) {
      const syncSession = async () => {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session) {
            // 1. Send Immediately
            window.postMessage({ type: "PICKLE_SYNC_SESSION", session }, "*");

            // 2. Retry every 500ms for 5 seconds (Handles race conditions)
            const intervalId = setInterval(() => {
              window.postMessage({ type: "PICKLE_SYNC_SESSION", session }, "*");
            }, 500);

            // Stop retrying after 5 seconds
            const timeoutId = setTimeout(() => {
              clearInterval(intervalId);
            }, 5000);

            // 3. Listen for ACK from Extension
            const handleAck = (event: MessageEvent) => {
              if (event.data?.type === "PICKLE_SYNC_ACK") {
                setStatus("success");
                clearInterval(intervalId);
                clearTimeout(timeoutId);
                window.removeEventListener("message", handleAck);
              }
            };
            window.addEventListener("message", handleAck);

            // Cleanup
            return () => {
              clearInterval(intervalId);
              clearTimeout(timeoutId);
              window.removeEventListener("message", handleAck);
            };
          } else {
            console.error("Session not found");
            setStatus("error");
          }
        } catch (e) {
          console.error("Sync failed", e);
          setStatus("error");
        }
      };

      syncSession();
    }
  }, [user, isLoading, supabase]);

  // Success일 때 카운트다운 및 창 닫기
  useEffect(() => {
    if (status === "success") {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            window.close();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [status]);

  // 1. Loading State
  if (status === "loading" && isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
        <h1 className="mb-4 font-bold text-gray-900 text-xl">
          Connecting to Pickle...
        </h1>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  // 2. Unauthenticated -> Show Login Button
  if (!user && !isLoading) {
    return (
      <Container>
        <h1 className="mb-2 font-bold text-2xl text-gray-900">
          Sync with Extension
        </h1>
        <p className="mb-8 text-gray-600">
          Please sign in to connect your account.
        </p>
        <GoogleAuthButton next="" />
      </Container>
    );
  }

  if (status === "error") {
    return (
      <Container>
        <h1 className="mb-2 font-bold text-red-600 text-xl">Sync Failed</h1>
        <p className="text-gray-600">Could not retrieve session info.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 rounded bg-gray-200 px-4 py-2 font-medium hover:bg-gray-300"
        >
          Retry
        </button>
      </Container>
    );
  }

  return (
    <Container>
      <div className="mb-3">
        <img src="/login-success.svg" alt="" />
      </div>
      <h1 className="mb-2 mb-3 font-bold text-[28px] text-white leading-[1.3]">
        로그인 성공!
      </h1>
      <p className="mb-10 text-center text-[16px] text-base-muted-foreground leading-[1.3]">
        피클에 로그인이 성공적으로 완료되었습니다.
        <br />
        <span className="font-bold text-base-primary transition-all">
          {countdown}초
        </span>{" "}
        뒤 이 창은 자동으로 닫힙니다.
      </p>
      <Button onClick={() => window.close()}>지금 닫기</Button>
    </Container>
  );
}

const Container = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="j flex h-full flex-col items-center justify-center">
      {children}
    </div>
  );
};

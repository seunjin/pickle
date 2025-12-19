"use client";

import { useEffect, useState } from "react";
import { useSessionContext } from "@/features/auth";
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
export default function AuthSyncPage() {
  const { user, isLoading } = useSessionContext();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [countdown, setCountdown] = useState(3);

  const supabase = createClient();

  // Direct Login Handler
  const handleLogin = async () => {
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
          Connecting to Pickle Note...
        </h1>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  // 2. Unauthenticated -> Show Login Button
  if (!user && !isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
        <h1 className="mb-2 font-bold text-2xl text-gray-900">
          Sync with Extension
        </h1>
        <p className="mb-8 text-gray-600">
          Please sign in to connect your account.
        </p>
        <button
          type="button"
          onClick={handleLogin}
          className="flex h-12 items-center justify-center gap-2 rounded-full border bg-white px-8 font-medium text-gray-700 shadow transition-colors hover:bg-gray-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <title>Google</title>
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Google로 계속하기
        </button>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
        <h1 className="mb-2 font-bold text-red-600 text-xl">Sync Failed</h1>
        <p className="text-gray-600">Could not retrieve session info.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 rounded bg-gray-200 px-4 py-2 font-medium hover:bg-gray-300"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
      <div className="mb-4 text-green-500">
        <svg
          className="mx-auto h-16 w-16"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <title>Success</title>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h1 className="mb-2 font-bold text-2xl text-gray-900">연결 성공!</h1>
      <p className="text-gray-600">
        계정이 성공적으로 연결되었습니다.
        <br />
        <span className="font-bold text-indigo-600 transition-all">
          {countdown}초
        </span>{" "}
        뒤 이 창은 자동으로 꺼집니다.
      </p>
      <button
        type="button"
        onClick={() => window.close()}
        className="mt-8 rounded-full bg-gray-900 px-6 py-2 text-sm text-white hover:bg-gray-800"
      >
        창 닫기
      </button>
    </div>
  );
}

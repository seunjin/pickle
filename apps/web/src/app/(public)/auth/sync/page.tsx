"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSessionContext } from "@/features/auth";

/**
 * 이 페이지는 웹 애플리케이션의 인증 세션을 브라우저 익스텐션과 동기화하는 역할을 합니다.
 *
 * 동작 방식:
 * 1. 사용자가 익스텐션의 'Connect Account' 버튼을 클릭하여 이 페이지를 엽니다.
 * 2. 페이지 로드 시 현재 로그인된 사용자가 있는지 확인합니다.
 * 3. 로그인되어 있지 않다면 로그인 페이지(홈)로 리다이렉트합니다.
 * 4. 로그인되어 있다면 `supabase.auth.getSession()`을 통해 전체 세션 정보(토큰 포함)를 가져옵니다.
 * 5. `window.postMessage`를 사용하여 `PICKLE_SYNC_SESSION` 이벤트를 발생시킵니다.
 * 6. 익스텐션의 Content Script가 이 메시지를 수신하여 `chrome.storage.local`에 세션을 저장합니다.
 */
export default function AuthSyncPage() {
  const { user, isLoading } = useSessionContext();
  const router = useRouter();
  const [status, setStatus] = useState("Syncing...");

  // 인증되지 않은 경우 강제 로그인 처리
  useEffect(() => {
    if (!isLoading && !user) {
      // 로그인 후 다시 이 페이지로 돌아오도록 설정하여 리다이렉트
      const params = new URLSearchParams({
        next: "/auth/sync",
      });
      // 로그인 버튼이 홈 페이지에 있거나 별도의 로그인 페이지가 있다고 가정
      router.replace(`/?${params.toString()}`);
    }
  }, [user, isLoading, router]);

  // 세션 브로드캐스트
  useEffect(() => {
    if (user && !isLoading) {
      // useSessionContext는 user/profile만 제공하므로 실제 세션 객체(토큰 포함)가 필요합니다.
      // 따라서 여기서 supabase 클라이언트를 통해 세션을 직접 비동기로 가져옵니다.

      const broadcastSession = async () => {
        // 클라이언트 사이드이므로 브라우저 클라이언트를 생성하는 비용은 저렴합니다.
        const { createClient } = await import("@/shared/lib/supabase/client");
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          console.log("Broadcasting session...", session.user.email);
          window.postMessage({ type: "PICKLE_SYNC_SESSION", session }, "*");
          setStatus("Connected! You can close this tab.");

          // 선택 사항: 몇 초 후 자동 닫기 기능 추가 가능?
          // 단, window.close()는 스크립트로 열린 창에서만 작동합니다.
        } else {
          setStatus("Failed to retrieve session.");
        }
      };

      broadcastSession();
    }
  }, [user, isLoading]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <h1 className="mb-4 font-bold text-2xl">Pickle Note Sync</h1>
      <p className="text-gray-600">{status}</p>
      {status === "Connected! You can close this tab." && (
        <div className="mt-8 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
          Browser Extension is now connected.
        </div>
      )}
    </div>
  );
}

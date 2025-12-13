"use client";

import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { LoginButton } from "@/features/auth";
import { createClient } from "@/shared/lib/supabase/client";

export default function TestConnectionPage() {
  const [status, setStatus] = useState<string>("Checking connection...");
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          // 로그인하지 않은 경우 사용자가 없는 것은 예상이지만, 연결 자체는 정상일 수 있습니다.
          // 보통 getUser는 세션이 없으면 에러를 던지나요?
          // 사실 getUser는 세션이 없으면 null 유저를 반환하지만, 연결 실패 시 표준 인증 에러를 반환하나요?
          // 응답을 받으면('Auth session missing!' 같은 인증 에러라도), 연결된 것으로 간주합시다.
          console.log("Auth check result:", error.message);
          setStatus(
            `Connected to Supabase (No active session: ${error.message})`,
          );
        } else {
          setUser(user);
          setStatus("Connected to Supabase (User session active)");
        }
      } catch (e) {
        setStatus(`Connection Failed: ${e}`);
        console.error(e);
      }
    };

    checkConnection();
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="font-bold text-2xl">Supabase Connection Test</h1>

      <LoginButton />

      <div className="rounded-lg border p-4 shadow-sm">
        <p className="font-medium">Status:</p>
        <p
          className={
            status.includes("Connected") ? "text-green-600" : "text-red-600"
          }
        >
          {status}
        </p>
      </div>
      {user && (
        <pre className="max-w-lg overflow-auto rounded bg-gray-100 p-4 text-xs">
          {JSON.stringify(user, null, 2)}
        </pre>
      )}
    </div>
  );
}

import type { Session, User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

interface UseSessionReturn {
  session: Session | null;
  user: User | null;
  isLoggedIn: boolean;
  signOut: () => void;
}

/**
 * Extension 전용 세션 관리 훅
 * chrome.storage.local에서 supabaseSession을 읽어 세션 상태를 관리
 */
export function useSession(): UseSessionReturn {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // 개발 모드 (chrome API 없음) 체크
    if (typeof chrome === "undefined" || !chrome.storage) {
      console.warn("[useSession] chrome.storage not available (dev mode)");
      return;
    }

    // 초기 세션 로드
    chrome.storage.local.get("supabaseSession", (result) => {
      setSession((result.supabaseSession as Session | undefined) ?? null);
    });

    // 세션 변경 감지
    const handleStorageChange = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string,
    ) => {
      if (areaName === "local" && changes.supabaseSession) {
        setSession(
          (changes.supabaseSession.newValue as Session | undefined) ?? null,
        );
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, []);

  const signOut = () => {
    if (typeof chrome === "undefined" || !chrome.storage) {
      console.warn("[useSession] chrome.storage not available (dev mode)");
      return;
    }
    chrome.storage.local.remove("supabaseSession");
  };

  return {
    session,
    user: session?.user ?? null,
    isLoggedIn: !!session,
    signOut,
  };
}

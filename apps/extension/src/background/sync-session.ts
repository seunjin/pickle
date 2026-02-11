/**
 * Extension → Client 세션 동기화 유틸리티
 *
 * Extension 로그인 후 Client 앱(app.pic-kle.io)으로 세션을 전파합니다.
 * Hash fragment(#)를 사용하여 토큰이 서버 접근 로그에 남지 않도록 합니다.
 */

import { logger } from "@shared/lib/logger";
import type { Session } from "@supabase/supabase-js";

const getClientUrl = () =>
  import.meta.env.VITE_APP_URL || "https://app.pic-kle.io";

/**
 * Client 앱에 세션을 전파하는 탭을 열어 자동 로그인을 수행합니다.
 *
 * 흐름: Extension 로그인 성공 → client /auth/extension-sync 페이지 열기
 *      → client에서 hash의 토큰으로 supabase.auth.setSession() 호출
 */
export function syncSessionToClient(session: Session) {
  const params = new URLSearchParams({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  });

  const syncUrl = `${getClientUrl()}/auth/extension-sync#${params.toString()}`;

  chrome.tabs.create({ url: syncUrl, active: false }, (tab) => {
    if (chrome.runtime.lastError) {
      logger.error("[Sync] Client 세션 동기화 탭 열기 실패", {
        error: chrome.runtime.lastError.message,
      });
      return;
    }
    logger.info("[Sync] Client 세션 동기화 탭 생성", { tabId: tab?.id });
  });
}

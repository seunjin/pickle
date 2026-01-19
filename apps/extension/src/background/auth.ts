/**
 * Extension OAuth 인증 모듈
 *
 * chrome.identity.launchWebAuthFlow를 사용하여
 * 익스텐션 내부에서 Google OAuth 로그인을 처리합니다.
 */

import {
  clearSession,
  getSession,
  getSupabaseClient,
  getValidSession,
  refreshSession,
  setSession,
} from "@shared/lib/supabase";
import type { Session } from "@supabase/supabase-js";

/**
 * OAuth 로그인 플로우 실행
 *
 * 1. Supabase OAuth URL 생성 (PKCE)
 * 2. chrome.identity.launchWebAuthFlow로 로그인 팝업 표시
 * 3. 콜백 URL에서 code 추출
 * 4. exchangeCodeForSession으로 세션 확정
 */
export async function launchOAuthFlow(): Promise<Session | null> {
  try {
    const client = getSupabaseClient();

    // Chrome Extension의 redirect URL
    const redirectUrl = chrome.identity.getRedirectURL();

    // Supabase OAuth URL 생성 (PKCE 모드)
    const { data, error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true, // URL만 생성, 브라우저 리다이렉트 안함
      },
    });

    if (error || !data.url) {
      console.error("[Auth] Failed to generate OAuth URL:", error);
      return null;
    }

    // launchWebAuthFlow로 로그인 팝업 표시
    const responseUrl = await new Promise<string>((resolve, reject) => {
      chrome.identity.launchWebAuthFlow(
        {
          url: data.url,
          interactive: true,
        },
        (callbackUrl) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          if (!callbackUrl) {
            reject(new Error("No callback URL received"));
            return;
          }
          resolve(callbackUrl);
        },
      );
    });

    // 콜백 URL에서 code 추출
    const url = new URL(responseUrl);
    const code = url.searchParams.get("code");

    if (!code) {
      // Hash fragment에서 확인 (Implicit flow fallback)
      const hashParams = new URLSearchParams(url.hash.substring(1));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      if (accessToken) {
        // Implicit flow 응답 처리
        const { data: userData, error: userError } =
          await client.auth.getUser(accessToken);
        if (userError || !userData.user) {
          console.error("[Auth] Failed to get user:", userError);
          return null;
        }

        const session: Session = {
          access_token: accessToken,
          refresh_token: refreshToken ?? "",
          token_type: "bearer",
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          user: userData.user,
        };

        await setSession(session);
        return session;
      }

      console.error("[Auth] No code or tokens in callback URL");
      return null;
    }

    // PKCE: code를 session으로 교환
    const { data: sessionData, error: sessionError } =
      await client.auth.exchangeCodeForSession(code);

    if (sessionError || !sessionData.session) {
      console.error("[Auth] Failed to exchange code:", sessionError);
      return null;
    }

    // 세션 저장
    await setSession(sessionData.session);

    return sessionData.session;
  } catch (error) {
    console.error("[Auth] OAuth flow error:", error);
    return null;
  }
}

/**
 * 로그아웃
 */
export async function logout(): Promise<void> {
  await clearSession();
  console.log("[Auth] Logged out");
}

/**
 * 현재 로그인 상태 확인
 */
export async function isLoggedIn(): Promise<boolean> {
  const session = await getValidSession();
  return !!session;
}

/**
 * 현재 사용자 정보 조회
 */
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

// Re-export for convenience
export { getSession, refreshSession, getValidSession, clearSession };

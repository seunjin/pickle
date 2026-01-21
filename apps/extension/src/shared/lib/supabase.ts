/**
 * Extension용 Supabase 클라이언트 래퍼
 *
 * MV3 Service Worker 환경에서 PKCE 인증을 지원하며,
 * 요청 직전에 세션 유효성을 검증하는 전략을 사용합니다.
 */

import type { Database } from "@pickle/contracts";
import {
  createClient,
  type Session,
  type SupabaseClient,
} from "@supabase/supabase-js";
import { chromeStorageAdapter } from "./chromeStorageAdapter";
import { logger } from "./logger";

const SUPABASE_URL = import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 세션 저장 키 (기존 호환성 유지)
const SESSION_STORAGE_KEY = "supabaseSession";

// 토큰 갱신 여유 시간 (5분)
const TOKEN_REFRESH_MARGIN_MS = 5 * 60 * 1000;

/**
 * PKCE 지원 Supabase 클라이언트 생성
 * chrome.storage.local 기반 Custom Storage Adapter 사용
 */
export function createExtensionSupabaseClient(): SupabaseClient<Database> {
  return createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      flowType: "pkce",
      persistSession: true,
      storage: chromeStorageAdapter,
      autoRefreshToken: false, // MV3에서 자동 갱신 불안정 → 수동 처리
      detectSessionInUrl: false, // Extension에서는 URL 감지 불필요
    },
  });
}

// 싱글톤 클라이언트 (Background용)
let _client: SupabaseClient<Database> | null = null;

export function getSupabaseClient(): SupabaseClient<Database> {
  if (!_client) {
    _client = createExtensionSupabaseClient();
  }
  return _client;
}

/**
 * 저장된 세션 조회
 */
export async function getSession(): Promise<Session | null> {
  try {
    const result = await chrome.storage.local.get(SESSION_STORAGE_KEY);
    const session = result[SESSION_STORAGE_KEY];
    // Session 타입 검증
    if (session && typeof session === "object" && "access_token" in session) {
      return session as Session;
    }
    return null;
  } catch (error) {
    logger.error("[Supabase] getSession error", { error });
    return null;
  }
}

/**
 * 세션 저장
 */
export async function setSession(session: Session): Promise<void> {
  await chrome.storage.local.set({ [SESSION_STORAGE_KEY]: session });
}

/**
 * 세션 삭제 (로그아웃)
 */
export async function clearSession(): Promise<void> {
  await chrome.storage.local.remove(SESSION_STORAGE_KEY);
  // PKCE 관련 데이터도 정리
  const client = getSupabaseClient();
  await client.auth.signOut();
}

/**
 * 세션 갱신 시도
 * Refresh Token을 사용하여 새 Access Token 발급
 */
export async function refreshSession(): Promise<Session | null> {
  try {
    const currentSession = await getSession();
    if (!currentSession?.refresh_token) {
      logger.warn("[Supabase] No refresh token available");
      return null;
    }

    const client = getSupabaseClient();
    const { data, error } = await client.auth.refreshSession({
      refresh_token: currentSession.refresh_token,
    });

    if (error) {
      logger.error("[Supabase] Refresh failed", { error });
      await clearSession();
      return null;
    }

    if (data.session) {
      await setSession(data.session);
      return data.session;
    }

    return null;
  } catch (error) {
    logger.error("[Supabase] refreshSession error", { error });
    return null;
  }
}

/**
 * 유효한 세션 반환 (핵심 함수)
 *
 * MV3 전략: 요청 직전에만 세션 유효성 검증
 * - 만료 5분 전이면 자동 갱신 시도
 * - 갱신 실패 시 null 반환 (재로그인 필요)
 */
export async function getValidSession(): Promise<Session | null> {
  const session = await getSession();
  if (!session) return null;

  const expiresAt = session.expires_at ?? 0;
  const now = Date.now();
  const expiresAtMs = expiresAt * 1000;

  // 이미 만료됨
  if (expiresAtMs <= now) {
    logger.debug("[Supabase] Session expired, attempting refresh");
    return refreshSession();
  }

  // 만료 임박 (5분 이내)
  if (expiresAtMs - now < TOKEN_REFRESH_MARGIN_MS) {
    logger.debug("[Supabase] Session expiring soon, refreshing");
    return refreshSession();
  }

  return session;
}

/**
 * 인증된 Supabase 클라이언트 생성
 * Authorization 헤더에 access_token을 포함시켜 RLS 정책 적용
 */
export async function getAuthenticatedClient(): Promise<SupabaseClient<Database> | null> {
  const session = await getValidSession();
  if (!session?.access_token) return null;

  return createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    },
  });
}

// apps/extension/src/shared/lib/logger.ts
// Extension 환경을 위한 통일된 로거 유틸리티
// CONVENTIONS.md §6 Console 로깅 정책 준수
// biome-ignore-all lint/suspicious/noConsole: 이 파일은 console wrapper이므로 예외

type LogContext = Record<string, unknown>;

// 개발 환경 판단 (Vite 빌드 시 import.meta.env 사용)
const isDev = import.meta.env?.DEV ?? false;

/**
 * Extension 전역 로거 유틸리티
 *
 * 사용법:
 * - logger.debug("메시지", { context }) → 개발 환경에서만 출력
 * - logger.info("메시지", { context }) → 운영 이슈 트래킹
 * - logger.warn("메시지", { context }) → 복구 가능한 비정상 상태
 * - logger.error("메시지", { context }) → 예외/실패 (반드시 컨텍스트 포함)
 *
 * 환경별 확인 방법:
 * - Content Script: 웹페이지 DevTools (Console)
 * - Background (Service Worker): chrome://extensions > 검사
 * - Popup: Popup 우클릭 > 검사
 */
export const logger = {
  /**
   * 개발 환경에서만 출력되는 디버그 로그
   * 프로덕션에서는 출력되지 않음
   */
  debug: (message: string, context?: LogContext) => {
    if (isDev) {
      console.debug(`[Pickle:DEBUG] ${message}`, context ?? "");
    }
  },

  /**
   * 사용자 플로우 추적, 운영 이슈 트래킹용
   */
  info: (message: string, context?: LogContext) => {
    console.info(`[Pickle:INFO] ${message}`, context ?? "");
  },

  /**
   * 복구 가능한 비정상 상태 (fallback 수행 시)
   */
  warn: (message: string, context?: LogContext) => {
    console.warn(`[Pickle:WARN] ${message}`, context ?? "");
  },

  /**
   * 예외/실패 - 반드시 컨텍스트 포함 필수
   */
  error: (message: string, context?: LogContext) => {
    console.error(`[Pickle:ERROR] ${message}`, context ?? "");

    // TODO: Sentry 연동 시 활성화
    // if (!isDev) {
    //   Sentry.captureMessage(message, {
    //     level: "error",
    //     extra: context,
    //   });
    // }
  },
};

// ─────────────────────────────────────────────────────────────
// 마스킹 유틸리티 (PII/Secret Rule 준수용)
// ─────────────────────────────────────────────────────────────

/**
 * 이메일 마스킹: user@example.com → u***@example.com
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  const maskedLocal = local.length > 1 ? `${local[0]}***` : "***";
  return `${maskedLocal}@${domain}`;
}

/**
 * 토큰 마스킹: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... → eyJh...J9
 */
export function maskToken(token: string): string {
  if (token.length <= 8) return "***";
  return `${token.slice(0, 4)}...${token.slice(-2)}`;
}

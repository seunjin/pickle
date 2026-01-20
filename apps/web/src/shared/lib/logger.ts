// shared/lib/logger.ts
// CONVENTIONS.md §6 Console 로깅 정책에 따른 통일된 로거 유틸리티

type LogContext = Record<string, unknown>;

/**
 * 프로젝트 전역 로거 유틸리티
 *
 * 사용법:
 * - logger.debug("메시지", { context }) → 개발 환경에서만 출력
 * - logger.info("메시지", { context }) → 운영 이슈 트래킹
 * - logger.warn("메시지", { context }) → 복구 가능한 비정상 상태
 * - logger.error("메시지", { context }) → 예외/실패 (반드시 컨텍스트 포함)
 *
 * PII/Secret Rule:
 * - access_token, refresh_token, Authorization 헤더 출력 금지
 * - 이메일, 전화번호, 실명 출력 금지
 * - 필요 시 마스킹 유틸리티 사용 (maskEmail, maskToken)
 */
export const logger = {
  /**
   * 개발 환경에서만 출력되는 디버그 로그
   * 프로덕션에서는 출력되지 않음
   */
  debug: (message: string, context?: LogContext) => {
    if (process.env.NODE_ENV === "development") {
      console.debug(`[DEBUG] ${message}`, context ?? "");
    }
  },

  /**
   * 사용자 플로우 추적, 운영 이슈 트래킹용
   */
  info: (message: string, context?: LogContext) => {
    console.info(`[INFO] ${message}`, context ?? "");
  },

  /**
   * 복구 가능한 비정상 상태 (fallback 수행 시)
   */
  warn: (message: string, context?: LogContext) => {
    console.warn(`[WARN] ${message}`, context ?? "");
  },

  /**
   * 예외/실패 - 반드시 컨텍스트 포함 필수
   * TODO: Sentry 연동 시 captureMessage 추가
   */
  error: (message: string, context?: LogContext) => {
    console.error(`[ERROR] ${message}`, context ?? "");

    // TODO: Sentry 연동 시 활성화
    // if (process.env.NODE_ENV === "production") {
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

/**
 * 일반 문자열 마스킹: 홍길동 → 홍**
 */
export function maskString(str: string, visibleChars = 1): string {
  if (str.length <= visibleChars) return "*".repeat(str.length);
  return `${str.slice(0, visibleChars)}${"*".repeat(str.length - visibleChars)}`;
}

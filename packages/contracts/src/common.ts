/**
 * DB Timestamp (ISO 8601 string)
 * - Postgres timestamptz / timestamp 컬럼 대응
 * - Date 객체가 아닌 문자열임을 명시하기 위한 타입
 * - DB ↔ API ↔ Client 경계에서 사용
 */
export type DbDate = string;

/**
 * Json
 * ----
 * Postgres의 JSON / JSONB 컬럼에
 * "그대로 저장될 수 있는 값"만을 표현하기 위한 유틸리티 타입.
 *
 * ✅ 사용 용도
 * - jsonb 데이터베이스 컬럼
 * - 구조가 고정되지 않은 메타데이터
 * - 외부 API의 raw response 저장
 * - 로그 / 이벤트 payload
 *
 * ❌ 사용하면 안 되는 곳
 * - 비즈니스 / 도메인 모델
 * - UI 상태, Form 데이터
 * - API 계약(Request/Response 타입)
 *
 * ⚠️ 주의
 * - 이 타입은 자동완성, 구조 보장을 제공하지 않음
 * - 도메인 로직에는 명시적인 TypeScript 타입이나
 *   Zod 스키마를 사용할 것
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

/**
 * Standard API Response Structure
 */
export interface ApiResponse<T> {
  data: T | null;
  error: {
    code: string;
    message: string;
    details?: unknown;
  } | null;
}

/**
 * Pagination Wrapper
 */
export interface Pagination<T> {
  list: T[];
  total: number;
  page: number;
  limit: number;
}

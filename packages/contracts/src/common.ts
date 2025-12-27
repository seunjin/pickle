/**
 * DB Timestamp (ISO 8601 string)
 * - Postgres timestamptz / timestamp 컬럼 대응
 * - Date 객체가 아닌 문자열임을 명시하기 위한 타입
 * - DB ↔ API ↔ Client 경계에서 사용
 */
export type DbDate = string;

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

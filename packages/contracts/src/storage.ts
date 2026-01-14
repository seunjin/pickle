/**
 * 스토리지 정책 관련 상수 및 타입
 */

export const DEFAULT_STORAGE_LIMIT_MB = 50;
export const DEFAULT_STORAGE_LIMIT_BYTES =
  DEFAULT_STORAGE_LIMIT_MB * 1024 * 1024;
export const STORAGE_WARNING_THRESHOLD = 0.9; // 90%

export interface WorkspaceStorageUsage {
  asset_bytes: number;
  bookmark_bytes: number;
  text_bytes: number;
  total_used_bytes: number;
  limit_bytes: number;
}

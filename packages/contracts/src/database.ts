/**
 * Database Definition (Schema-First)
 *
 * 이 파일은 Supabase CLI로 자동 생성된 `database-generated.ts`에서
 * 타입을 가져와서 애플리케이션 전반에 내보내는 역할을 합니다.
 *
 * 수동으로 타입을 정의하지 마세요!
 * DB 변경 시: `pnpm types:local` 또는 `pnpm types:remote` 실행
 */

export type { Database } from "./database-generated";

// 자주 사용하는 Helper 타입 (Row, Insert, Update)
import type { Database } from "./database-generated";

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];

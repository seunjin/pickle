import { z } from "zod";
import type { Database } from "./database";

// DB Row Type (renamed from profiles -> users)
type UserRow = Database["public"]["Tables"]["users"]["Row"];

// --- Enums / Constants ---

export const PLATFORM_AUTHORITIES = ["super_admin", "admin", "member"] as const;
export type PlatformAuthority = (typeof PLATFORM_AUTHORITIES)[number];

export const USER_STATUSES = [
  "pending",
  "active",
  "suspended",
  "deleted",
] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

// --- Schemas ---

/**
 * App Level User Schema (formerly Profile)
 *
 * Supabase Auth의 `users` 테이블과 별개로 애플리케이션 레벨의 사용자 정보를 관리하는 `users` 테이블 스키마입니다.
 */
export const appUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  full_name: z.string(),
  avatar_url: z.string().url().nullable().optional(), // DB allows null
  authority: z.enum(PLATFORM_AUTHORITIES).nullable(),
  status: z.enum(USER_STATUSES),
  is_terms_agreed: z.boolean(),
  is_privacy_agreed: z.boolean(),
  is_marketing_agreed: z.boolean(),
  is_over_14: z.boolean(),
  created_at: z.string(),
});

export type AppUser = z.infer<typeof appUserSchema>;

/**
 * Update User Schema
 * 사용자가 변경 가능한 필드만 허용
 */
export const updateUserSchema = appUserSchema
  .pick({
    full_name: true,
    avatar_url: true,
    is_marketing_agreed: true,
  })
  .partial();

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

// --- Type Verification ---
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const _checkUserSchema = (x: AppUser): UserRow => {
  // Manual check for null compatibility if needed, or simple assignment
  return {
    ...x,
    avatar_url: x.avatar_url ?? null, // Convert optional/undefined to null for DB Row check if strict
    authority: x.authority ?? null,
  };
};

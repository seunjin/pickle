import { z } from "zod";

// --- Enums / Constants ---

export const PLATFORM_AUTHORITIES = ["super_admin", "admin"] as const;
export type PlatformAuthority = (typeof PLATFORM_AUTHORITIES)[number];

export const USER_STATES = ["guest", "member", "suspended", "deleted"] as const;
export type UserState = (typeof USER_STATES)[number];

// --- Schemas ---

/**
 * User Profile Schema
 *
 * Supabase Auth의 `users` 테이블과 별개로 애플리케이션 레벨의 사용자 정보를 관리하는 `profiles` 테이블 스키마입니다.
 * `id`는 Supabase Auth의 `user.id`와 FK로 연결됩니다.
 */
export const profileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  full_name: z.string(),
  avatar_url: z.string().url().optional().or(z.literal("")),
  authority: z.enum(PLATFORM_AUTHORITIES).nullable(),
  state: z.enum(USER_STATES),
  created_at: z.string(), // DbDate
});

export type Profile = z.infer<typeof profileSchema>;

/**
 * Update Profile Schema
 *
 * 사용자가 변경 가능한 프로필 필드(이름, 아바타)만 허용합니다.
 */
export const updateProfileSchema = profileSchema
  .pick({
    full_name: true,
    avatar_url: true,
  })
  .partial();

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

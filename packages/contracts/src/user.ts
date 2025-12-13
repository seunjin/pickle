import { z } from "zod";

// --- Enums / Constants ---

export const PLATFORM_AUTHORITIES = ["super_admin", "admin"] as const;
export type PlatformAuthority = (typeof PLATFORM_AUTHORITIES)[number];

export const USER_STATES = ["guest", "member", "suspended", "deleted"] as const;
export type UserState = (typeof USER_STATES)[number];

// --- Schemas ---

/**
 * User Profile Schema
 * Supabase 'profiles' table mapping
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
 */
export const updateProfileSchema = profileSchema
  .pick({
    full_name: true,
    avatar_url: true,
  })
  .partial();

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

import { z } from "zod";

// --- Enums ---

export const WORKSPACE_ROLES = ["owner", "member"] as const;
export type WorkspaceRole = (typeof WORKSPACE_ROLES)[number];

// --- Schemas ---

/**
 * Workspace Schema
 *
 * 사용자가 소속된 작업 공간입니다.
 * 모든 노트와 에셋은 특정 워크스페이스에 귀속됩니다 (`workspace_id`).
 */
export const workspaceSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  storage_limit_bytes: z.number().nullable(),
  created_at: z.string(), // DbDate
  updated_at: z.string(), // DbDate
});

/**
 * Workspace Member Schema
 *
 * 사용자와 워크스페이스 간의 N:M 관계를 정의합니다.
 * `role`을 통해 권한 수준(owner, member)을 관리합니다.
 */
export const workspaceMemberSchema = z.object({
  workspace_id: z.string().uuid(),
  user_id: z.string().uuid(),
  role: z.enum(WORKSPACE_ROLES),
  joined_at: z.string(), // DbDate
});

export type Workspace = z.infer<typeof workspaceSchema>;
export type WorkspaceMember = z.infer<typeof workspaceMemberSchema>;

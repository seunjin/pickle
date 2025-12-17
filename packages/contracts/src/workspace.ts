import { z } from "zod";

// --- Enums ---

export const WORKSPACE_ROLES = ["owner", "member"] as const;
export type WorkspaceRole = (typeof WORKSPACE_ROLES)[number];

// --- Schemas ---

export const workspaceSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  created_at: z.string(), // DbDate
  updated_at: z.string(), // DbDate
});

export const workspaceMemberSchema = z.object({
  workspace_id: z.string().uuid(),
  user_id: z.string().uuid(),
  role: z.enum(WORKSPACE_ROLES),
  joined_at: z.string(), // DbDate
});

export type Workspace = z.infer<typeof workspaceSchema>;
export type WorkspaceMember = z.infer<typeof workspaceMemberSchema>;

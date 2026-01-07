import { z } from "zod";
import type { Database } from "./database-generated";

// DB Row Type
type FolderRow = Database["public"]["Tables"]["folders"]["Row"];

// Zod Schema for Folder
export const folderSchema = z.object({
  id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  color: z.string().default("gray"),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Folder = z.infer<typeof folderSchema>;

// Create/Update DTOs
export const createFolderSchema = folderSchema
  .pick({
    name: true,
    color: true,
  })
  .partial({ color: true });

export const updateFolderSchema = folderSchema
  .pick({
    name: true,
    color: true,
  })
  .partial();

export type CreateFolderDto = z.infer<typeof createFolderSchema>;
export type UpdateFolderDto = z.infer<typeof updateFolderSchema>;

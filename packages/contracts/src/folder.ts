import { z } from "zod";

// Zod Schema for Folder
export const folderSchema = z.object({
  id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  color: z.string().default("gray"),
  deleted_at: z.string().datetime({ offset: true }).nullable().optional(),
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
    deleted_at: true,
  })
  .partial();

export type CreateFolderDto = z.infer<typeof createFolderSchema>;
export type UpdateFolderDto = z.infer<typeof updateFolderSchema>;

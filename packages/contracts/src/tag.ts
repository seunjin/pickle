import { z } from "zod";
import type { Database } from "./database-generated";

type TagRow = Database["public"]["Tables"]["tags"]["Row"];

export const TAG_COLORS = [
  "purple",
  "blue",
  "yellow",
  "orange",
  "green",
  "gray",
  "cyan",
  "indigo",
  "magenta",
  "lime",
  "emerald",
  "red",
] as const;

export type TagColor = (typeof TAG_COLORS)[number];

export const tagSchema = z.object({
  id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  name: z.string().min(1),
  style: z.enum(TAG_COLORS),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Tag = z.infer<typeof tagSchema>;

export const createTagInputSchema = tagSchema.pick({
  workspace_id: true,
  name: true,
  style: true,
});

export type CreateTagInput = z.infer<typeof createTagInputSchema>;

export const updateTagInputSchema = tagSchema
  .pick({
    name: true,
    style: true,
  })
  .partial();

export type UpdateTagInput = z.infer<typeof updateTagInputSchema>;

/**
 * DB Row 타입과의 일관성 체크
 * @internal
 */
export const _checkTagSchema = (x: Tag): TagRow => x;

import { z } from "zod";

export const ASSET_TYPES = ["image", "capture"] as const;
export type AssetType = (typeof ASSET_TYPES)[number];

export const assetSchema = z.object({
  id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  owner_id: z.string().uuid(),
  type: z.enum(ASSET_TYPES), // image, capture etc.
  full_path: z.string(), // storage path "bitmaps/user_id/uuid.png"
  thumb_path: z.string().nullable().optional(), // optional thumbnail
  full_size_bytes: z.number().int(),
  thumb_size_bytes: z.number().int().optional(),
  width: z.number().int().optional(),
  height: z.number().int().optional(),
  created_at: z.string(), // DbDate
});

export type Asset = z.infer<typeof assetSchema>;

// For creating new assets
export const createAssetSchema = assetSchema.omit({
  id: true,
  created_at: true,
});

export type CreateAssetInput = z.infer<typeof createAssetSchema>;

import { z } from "zod";
import type { Database } from "./database";

type AssetRow = Database["public"]["Tables"]["assets"]["Row"];

export const ASSET_TYPES = ["image", "capture"] as const;
export type AssetType = (typeof ASSET_TYPES)[number];

/**
 * Asset Schema
 *
 * Supabase Storage에 업로드된 파일의 메타데이터를 저장하는 테이블 스키마입니다.
 * `notes` 테이블과 1:1 또는 1:N 관계를 가질 수 있으며,
 * `full_path`를 통해 실제 스토리지 파일에 접근합니다.
 */
export const assetSchema = z.object({
  id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  owner_id: z.string().uuid(),
  type: z.enum(ASSET_TYPES), // image, capture etc.
  full_path: z.string(), // storage path "bitmaps/user_id/uuid.png"
  thumb_path: z.string().nullable(),
  full_size_bytes: z.number().int(),
  thumb_size_bytes: z.number().int().nullable(),
  width: z.number().int().nullable(),
  height: z.number().int().nullable(),
  created_at: z.string(), // DbDate
});

export type Asset = z.infer<typeof assetSchema>;

/**
 * Asset Creation Input
 *
 * 이미지 업로드 직후, DB에 메타데이터를 저장할 때 사용합니다.
 */
export const createAssetSchema = assetSchema.omit({
  id: true,
  created_at: true,
});

export type CreateAssetInput = z.infer<typeof createAssetSchema>;

// --- Type Verification ---
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _checkAssetSchema = (x: Asset): AssetRow => x;

import { z } from "zod";
import type { Database } from "./database"; // Schema-First Type

// 1. Get Real DB Type
type NoteRow = Database["public"]["Tables"]["notes"]["Row"];

// --- Enums ---

export const NOTE_TYPES = ["text", "image", "capture", "bookmark"] as const;
export type NoteType = (typeof NOTE_TYPES)[number];

// --- 1. Stored Data Schemas (Clean) ---
export const storedTextDataSchema = z.object({ text: z.string() });
export const storedImageDataSchema = z.object({
  alt_text: z.string().optional(),
});
export const storedCaptureDataSchema = z.object({
  width: z.number(),
  height: z.number(),
});
export const storedBookmarkDataSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  image: z.string().url().optional(),
  favicon: z.string().url().optional(),
  site_name: z.string().optional(),
});

// --- 2. Input Data Schemas (Dirty) ---
export const createTextDataSchema = storedTextDataSchema;
export const createImageDataSchema = z.object({
  image_url: z.string(), // Base64 or URL
  alt_text: z.string().optional(),
});
export const createCaptureDataSchema = z.object({
  image_url: z.string(), // Unified Key
  width: z.number(),
  height: z.number(),
});
export const createBookmarkDataSchema = storedBookmarkDataSchema;

// --- Common Fields ---
const commonNoteFields = z.object({
  url: z.string().url(),
  content: z.string().nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
});

const commonDbFields = z.object({
  id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  user_id: z.string().uuid(),
  asset_id: z.string().uuid().nullable(),
  content: z.string().nullable(),
  tags: z.array(z.string()).nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

// --- 3. Discriminated Unions (The Core Fix) ---

/**
 * 3-1. Create Note Input (Discriminated by 'type')
 *
 * 서버로 노트를 생성 요청할 때 사용하는 입력 타입입니다.
 * `type` 필드에 따라 `data` 필드의 타입이 자동으로 좁혀집니다 (Discriminated Union).
 *
 * Example:
 * if (input.type === 'image') {
 *   // input.data has 'image_url'
 * }
 */
export const createTextNoteInput = commonNoteFields.extend({
  type: z.literal("text"),
  data: createTextDataSchema,
});
export const createImageNoteInput = commonNoteFields.extend({
  type: z.literal("image"),
  data: createImageDataSchema,
});
export const createCaptureNoteInput = commonNoteFields.extend({
  type: z.literal("capture"),
  data: createCaptureDataSchema,
});
export const createBookmarkNoteInput = commonNoteFields.extend({
  type: z.literal("bookmark"),
  data: createBookmarkDataSchema,
});

export const createNoteSchema = z.discriminatedUnion("type", [
  createTextNoteInput,
  createImageNoteInput,
  createCaptureNoteInput,
  createBookmarkNoteInput,
]);

export type CreateNoteInput = z.infer<typeof createNoteSchema>;

/**
 * 3-2. DB Row (Discriminated by 'type')
 *
 * DB에서 조회한 노트 데이터 타입입니다.
 * `data` 컬럼에는 Data URL 같은 무거운 데이터가 들어가지 않으며 (Stored Schema),
 * 메타데이터 위주로 구성됩니다.
 *
 * 역시 `type`에 따라 `data` 구조가 달라지는 Discriminated Union입니다.
 */
export const textNoteSchema = commonNoteFields.merge(commonDbFields).extend({
  type: z.literal("text"),
  data: storedTextDataSchema,
});
export const imageNoteSchema = commonNoteFields.merge(commonDbFields).extend({
  type: z.literal("image"),
  data: storedImageDataSchema,
});
export const captureNoteSchema = commonNoteFields.merge(commonDbFields).extend({
  type: z.literal("capture"),
  data: storedCaptureDataSchema,
});
export const bookmarkNoteSchema = commonNoteFields
  .merge(commonDbFields)
  .extend({
    type: z.literal("bookmark"),
    data: storedBookmarkDataSchema,
  });

export const noteSchema = z.discriminatedUnion("type", [
  textNoteSchema,
  imageNoteSchema,
  captureNoteSchema,
  bookmarkNoteSchema,
]);

export type Note = z.infer<typeof noteSchema>;

// Need to export Stored schemas for partial usage if needed, but 'Note' type is preferred user
export type StoredNoteData =
  | z.infer<typeof storedTextDataSchema>
  | z.infer<typeof storedImageDataSchema>
  | z.infer<typeof storedCaptureDataSchema>
  | z.infer<typeof storedBookmarkDataSchema>;

// --- API Wrappers (Update) ---
export const updateNoteSchema = z.object({
  content: z.string().optional(),
  tags: z.array(z.string()).optional(),
});
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;

// --- 4. Type Verification (Schema-First) ---
/**
 * DB 스키마와 애플리케이션 스키마의 일치 여부를 검증합니다.
 * 만약 DB 컬럼이 변경되었는데 위 Zod 스키마를 수정하지 않으면 여기서 에러가 발생합니다.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// --- 5. Joined Schemas (API Responses) ---
import { assetSchema } from "./asset";

export const noteWithAssetSchema = noteSchema.and(
  z.object({ assets: assetSchema.nullable() }),
);

export type NoteWithAsset = z.infer<typeof noteWithAssetSchema>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _checkNoteSchema = (x: Note): NoteRow => x;

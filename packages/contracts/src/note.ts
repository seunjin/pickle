import { z } from "zod";
import type { Database } from "./database"; // Schema-First Type

// 1. Get Real DB Type
type NoteRow = Database["public"]["Tables"]["notes"]["Row"];

// --- 1. 공통 메타데이터 스키마 (순수 메타데이터) ---
// DB의 'data.meta' 필드에 저장될 순수 메타데이터입니다.
// A안 적용: URL도 Meta의 일부로 관리합니다.
// Helper for optional URL that treats empty string as undefined
const optionalUrl = z.preprocess(
  (v) => (v === "" || v === null ? undefined : v),
  z.string().url().optional(),
);

export const commonMetaDataSchema = z.object({
  url: z.string().url(), // 메인 URL
  favicon: optionalUrl,
  site_name: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  image: optionalUrl,
});

// --- 2. 저장된 데이터 스키마 (순수 콘텐츠) ---
// 경고: User 요청에 따라 여기에 meta를 포함하지 않습니다.
// 이것은 순수한 콘텐츠 데이터(Type-specific content)만 정의합니다.
export const storedTextDataSchema = z.object({
  text: z.string(),
});

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
  image: optionalUrl,
});

// --- 3. 입력 데이터 스키마 (생성 페이로드) ---
// 클라이언트가 노트를 생성할 때 보내는 데이터 구조입니다.
// stored*DataSchema를 재사용하되, 필요한 경우 확장합니다.

// 3-1. 타입별 입력 데이터 (Clean - Meta 없음)
export const createTextDataSchema = storedTextDataSchema;
export const createImageDataSchema = z.object({
  image_url: z.string(), // Base64 or URL
  alt_text: z.string().optional(),
});
export const createCaptureDataSchema = z.object({
  image_url: z.string(),
  width: z.number(),
  height: z.number(),
});
export const createBookmarkDataSchema = storedBookmarkDataSchema;

// --- 4. 공통 필드 및 유효성 검사 로직 ---

/**
 * URL 정규화 및 유효성 검사
 * - 빈 값 불허 (min(1))
 * - http/https 프로토콜 자동 추가
 * - 유효한 URL 형태 검증
 */
const urlSchema = z
  .string()
  .trim()
  .min(1, "URL은 필수입니다.")
  .transform((v) => (/^https?:\/\//i.test(v) ? v : `https://${v}`))
  .pipe(z.string().url());

// 입력용 메타데이터 스키마 (Input only)
// 생성 시 URL 변환 로직 등을 포함합니다.
const createInputMetaSchema = z.object({
  url: urlSchema,
  favicon: optionalUrl,
  site_name: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  image: optionalUrl,
});

// 4-1. 공통 입력 필드 (생성)
// 여기서 meta는 최상위 레벨에 위치합니다.
const commonInputFields = z.object({
  meta: createInputMetaSchema,
  memo: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// 4-2. 공통 DB 필드 (엄격한 DB 행)
const commonDbFields = z.object({
  id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  user_id: z.string().uuid(),
  asset_id: z.string().uuid().nullable(),
  memo: z.string().nullable(),
  url: z.string().url(), // DB 데이터 무결성 체크
  // 핵심 변경: Meta를 Data와 분리하여 별도 컬럼으로 정의 (DB Schema Change Required)
  meta: commonMetaDataSchema.nullable(),
  tags: z.array(z.string()).nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

// --- 5. 생성 스키마 (구별된 유니온) ---
// Input 타입 정의: data 필드 내부에 meta가 없습니다. (User Requirement)
export const createTextNoteInput = commonInputFields.extend({
  type: z.literal("text"),
  data: createTextDataSchema,
});
export const createImageNoteInput = commonInputFields.extend({
  type: z.literal("image"),
  data: createImageDataSchema,
});
export const createCaptureNoteInput = commonInputFields.extend({
  type: z.literal("capture"),
  data: createCaptureDataSchema,
});
export const createBookmarkNoteInput = commonInputFields.extend({
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

// --- 6. 앱 모델 / DB 스키마 (저장됨) ---

// 6-1. 엄격한 DB 스키마 (변환 전)
// DB 전략 Update: data 컬럼에는 순수 데이터만, meta는 별도 meta 컬럼에 저장
export const strictTextNoteSchema = commonDbFields.extend({
  type: z.literal("text"),
  data: storedTextDataSchema,
});
export const strictImageNoteSchema = commonDbFields.extend({
  type: z.literal("image"),
  data: storedImageDataSchema,
});
export const strictCaptureNoteSchema = commonDbFields.extend({
  type: z.literal("capture"),
  data: storedCaptureDataSchema,
});
export const strictBookmarkNoteSchema = commonDbFields.extend({
  type: z.literal("bookmark"),
  data: storedBookmarkDataSchema,
});

// 6-2. 엄격한 유니온
export const strictNoteSchema = z.discriminatedUnion("type", [
  strictTextNoteSchema,
  strictImageNoteSchema,
  strictCaptureNoteSchema,
  strictBookmarkNoteSchema,
]);

// 6-3. 앱 모델 스키마 (변환)
// DB에서 꺼낸 데이터를 앱에서 사용하기 편하게 변환합니다.
// 6-3. 앱 모델 스키마 (변환)
// DB에서 꺼낸 데이터를 앱에서 사용하기 편하게 변환합니다.
export const noteSchema = strictNoteSchema.transform((row) => {
  // 앱 레벨 메타데이터 구성 (Top-level Meta Column + URL Column)
  const meta = row.meta || {};
  const appMeta = {
    ...meta,
    title: (meta as { title?: string }).title,
    url: row.url, // Source of Truth
  };

  return {
    ...row,
    memo: row.memo ?? undefined,
    tags: row.tags ?? [],
    meta: appMeta, // Unified access
    data: row.data, // Clean data directly
  } as Note; // Explicit cast to ensure Discriminated Union
});

// API 응답/저장용 데이터 타입 (Clean Data Only)
// DB data 컬럼에는 순수 Type-specific 데이터만 저장됩니다.
export type StoredNoteData =
  | z.infer<typeof storedTextDataSchema>
  | z.infer<typeof storedImageDataSchema>
  | z.infer<typeof storedCaptureDataSchema>
  | z.infer<typeof storedBookmarkDataSchema>;

type TransformToApp<
  T extends {
    data: StoredNoteData;
    url: string;
    meta: z.infer<typeof commonMetaDataSchema> | null;
    memo: string | null;
    tags: string[] | null;
  },
> = Omit<T, "meta" | "memo" | "tags"> & {
  memo: string | undefined;
  tags: string[];
  meta: { url: string } & (Exclude<T["meta"], null> | Record<string, never>); // Ensure meta is object with url
  data: T["data"];
};

// Explicitly define Note as a Discriminated Union
export type Note =
  | TransformToApp<z.infer<typeof strictTextNoteSchema>>
  | TransformToApp<z.infer<typeof strictImageNoteSchema>>
  | TransformToApp<z.infer<typeof strictCaptureNoteSchema>>
  | TransformToApp<z.infer<typeof strictBookmarkNoteSchema>>;

// --- API 래퍼 (업데이트) ---
export const updateNoteSchema = z.object({
  memo: z.string().optional(),
  tags: z.array(z.string()).optional(),
  meta: z
    .object({
      url: z.string().url().optional(),
      favicon: optionalUrl,
      site_name: z.string().optional(),
      title: z.string().optional(),
      description: z.string().optional(),
      image: optionalUrl,
    })
    .optional(),
});
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;

// --- 7. 타입 검증 (스키마 우선) ---
import { assetSchema } from "./asset";

export const noteWithAssetSchema = strictNoteSchema
  .and(z.object({ assets: assetSchema.nullable() }))
  .transform((row) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const meta = row.meta || {};
    const appMeta = {
      ...meta,
      title: (meta as { title?: string }).title,
      url: row.url,
    };
    return {
      ...row,
      memo: row.memo ?? undefined,
      tags: row.tags ?? [],
      meta: appMeta,
      data: row.data,
    } as NoteWithAsset; // Explicit cast
  });

// Explicitly define NoteWithAsset as Discriminated Union
// Same as Note but with assets field
type WithAssets<T> = T & { assets: z.infer<typeof assetSchema> | null };

export type NoteWithAsset =
  | WithAssets<TransformToApp<z.infer<typeof strictTextNoteSchema>>>
  | WithAssets<TransformToApp<z.infer<typeof strictImageNoteSchema>>>
  | WithAssets<TransformToApp<z.infer<typeof strictCaptureNoteSchema>>>
  | WithAssets<TransformToApp<z.infer<typeof strictBookmarkNoteSchema>>>;

// DB 일관성 체크
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const _checkNoteSchema = (
  x: z.infer<typeof strictNoteSchema>,
): NoteRow => x;

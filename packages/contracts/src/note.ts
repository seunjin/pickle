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
  image_width: z.number().optional(), // [NEW] 외부 이미지 너비
  image_height: z.number().optional(), // [NEW] 외부 이미지 높이
});

// --- 2. 저장된 데이터 스키마 (순수 콘텐츠) ---
// 경고: User 요청에 따라 여기에 meta를 포함하지 않습니다.
// 이것은 순수한 콘텐츠 데이터(Type-specific content)만 정의합니다.
// [Refactor] 2024-12-27: data 스키마 정리
export const storedTextDataSchema = z.object({
  text: z.string(),
});

export const storedImageDataSchema = z.object({
  // [Refactor] Image data is now empty.
  // Original meta -> 'meta' column
  // Asset -> 'assets' table
});

export const storedCaptureDataSchema = z.object({
  display_width: z.number(),
  display_height: z.number(),
});

export type StoredImageData = z.infer<typeof storedImageDataSchema>;
export type StoredCaptureData = z.infer<typeof storedCaptureDataSchema>;
export type StoredBookmarkData = z.infer<typeof storedBookmarkDataSchema>;

export const storedBookmarkDataSchema = z.object({
  // [Refactor] Bookmark data is now empty.
  // Original meta -> 'meta' column
  // User memo -> 'memo' column
  // User title -> 'title' column (top-level)
});

// --- 3. 입력 데이터 스키마 (생성 페이로드) ---
// 클라이언트가 노트를 생성할 때 보내는 데이터 구조입니다.
// stored*DataSchema를 재사용하되, 필요한 경우 확장합니다.

// 3-1. 타입별 입력 데이터 (Clean - Meta 없음)
export const createTextDataSchema = storedTextDataSchema;
export const createImageDataSchema = z.object({
  image_url: z.string(), // Base64 or URL (Transient)
});
export const createCaptureDataSchema = z.object({
  image_url: z.string(),
  display_width: z.number(),
  display_height: z.number(),
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
  image_width: z.number().optional(),
  image_height: z.number().optional(),
});

// 4-1. 공통 입력 필드 (생성)
// 여기서 meta는 최상위 레벨에 위치합니다.
const commonInputFields = z.object({
  title: z.string().optional(), // [Refactor] User Title
  meta: createInputMetaSchema,
  memo: z.string().optional(),
  tags: z.array(z.string()).optional(),
  blurDataUrl: z.string().optional(), // [NEW] Transient field for blur preview
});

// 4-2. 공통 DB 필드 (엄격한 DB 행)
const commonDbFields = z.object({
  id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  user_id: z.string().uuid(),
  asset_id: z.string().uuid().nullable(),
  folder_id: z.string().uuid().nullable(), // ✅ 폴더 참조
  title: z.string().nullable(), // [Refactor] Top-level Title
  memo: z.string().nullable(),
  url: z.string().url(), // DB 데이터 무결성 체크
  // 핵심 변경: Meta를 Data와 분리하여 별도 컬럼으로 정의 (DB Schema Change Required)
  meta: commonMetaDataSchema.nullable(),
  tags: z.array(z.string()).nullable(),
  bookmarked_at: z.string().datetime({ offset: true }).nullable(),
  deleted_at: z.string().datetime({ offset: true }).nullable(), // ✅ Soft Delete
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

// 6-3. 앱 모델 스키마 (변환 없음 - Zero Overhead)
// UI 컴포넌트는 최상위 'url', 'title'을 직접 참조해야 합니다. (note.url, note.title)
export const noteSchema = strictNoteSchema;

// API 응답/저장용 데이터 타입 (Clean Data Only)
// DB data 컬럼에는 순수 Type-specific 데이터만 저장됩니다.
export type StoredNoteData =
  | z.infer<typeof storedTextDataSchema>
  | z.infer<typeof storedImageDataSchema>
  | z.infer<typeof storedCaptureDataSchema>
  | z.infer<typeof storedBookmarkDataSchema>;

// Explicitly define Note as a Discriminated Union
export type Note = z.infer<typeof strictNoteSchema>;

// --- API 래퍼 (업데이트) ---
export const updateNoteSchema = z.object({
  title: z.string().optional(),
  memo: z.string().optional(),
  url: z.string().url().optional(), // ✅ 최상위 URL 업데이트 지원
  data: z.any().optional(), // ✅ 타입별 데이터(예: text) 업데이트 지원
  meta: commonMetaDataSchema.optional(),
  tags: z.array(z.string()).optional(),
  bookmarked_at: z.string().datetime({ offset: true }).nullable().optional(),
  deleted_at: z.string().datetime({ offset: true }).nullable().optional(), // ✅ 복원/삭제 지원
  folder_id: z.string().uuid().nullable().optional(), // ✅ 폴더 이동 기능
});
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;

// --- 7. 타입 검증 (스키마 우선) ---
import { assetSchema } from "./asset";
import { tagSchema } from "./tag";

export const noteWithAssetSchema = strictNoteSchema.and(
  z.object({
    assets: assetSchema.nullable(),
    tag_list: z.array(tagSchema).optional(), // note_tags 조인을 통해 가져올 정규화된 태그 목록
  }),
);

// Explicitly define NoteWithAsset as Discriminated Union
export type NoteWithAsset = z.infer<typeof noteWithAssetSchema>;

// DB 일관성 체크
export const _checkNoteSchema = (
  x: z.infer<typeof strictNoteSchema>,
): NoteRow => x;

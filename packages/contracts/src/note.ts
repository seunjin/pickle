import { z } from "zod";

// --- Enums ---

export const NOTE_TYPES = ["text", "image", "capture", "bookmark"] as const;
export type NoteType = (typeof NOTE_TYPES)[number];

// --- Data Schemas by Type ---

export const textDataSchema = z.object({
  text: z.string(),
});

export const imageDataSchema = z.object({
  image_url: z.string().url(),
  alt_text: z.string().optional(),
});

export const captureDataSchema = z.object({
  screenshot_url: z.string().url(),
  width: z.number(),
  height: z.number(),
});

export const bookmarkDataSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  image: z.string().url().optional(),
  favicon: z.string().url().optional(),
  site_name: z.string().optional(),
});

// Union Schema for 'data' field
export const noteDataSchema = z.union([
  textDataSchema,
  imageDataSchema,
  captureDataSchema,
  bookmarkDataSchema,
]);

// --- Note Schema ---

export const noteSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  type: z.enum(NOTE_TYPES),
  url: z.string().url(),
  content: z.string().nullable(), // User memo
  data: noteDataSchema, // JSONB data
  tags: z.array(z.string()).default([]),
  created_at: z.string(), // DbDate
  updated_at: z.string(), // DbDate
});

export type Note = z.infer<typeof noteSchema>;

// --- API Wrappers ---

/**
 * Note Creation Input
 */
export const createNoteSchema = z.object({
  type: z.enum(NOTE_TYPES),
  url: z.string().url(),
  content: z.string().optional(),
  data: noteDataSchema,
  tags: z.array(z.string()).optional(),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;

/**
 * Note Update Input
 */
export const updateNoteSchema = z.object({
  content: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;

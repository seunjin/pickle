import { z } from "zod";

export const legalDocumentTypeSchema = z.enum([
  "service",
  "privacy",
  "marketing",
]);
export type LegalDocumentType = z.infer<typeof legalDocumentTypeSchema>;

export const legalDocumentSchema = z.object({
  id: z.string().uuid(),
  type: legalDocumentTypeSchema,
  version: z.string(),
  title: z.string(),
  content: z.string(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
  created_by: z.string().uuid().nullable(),
});

export type LegalDocument = z.infer<typeof legalDocumentSchema>;

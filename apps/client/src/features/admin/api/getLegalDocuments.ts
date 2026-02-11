import type {
  LegalDocument,
  LegalDocumentType,
} from "@pickle/contracts/src/legal";
import { legalDocumentSchema } from "@pickle/contracts/src/legal";
import { logger } from "@/shared/lib/logger";
import { createClient } from "@/shared/lib/supabase";

/**
 * 특정 유형의 모든 약관 버전 목록을 가져옵니다. (최신순)
 */
export async function getLegalDocuments(
  type: LegalDocumentType,
): Promise<LegalDocument[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("legal_documents")
    .select("*")
    .eq("type", type)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const parsed = legalDocumentSchema.array().safeParse(data);

  if (!parsed.success) {
    logger.error(`[Legal] List validation failed for type: ${type}`, {
      error: parsed.error,
    });
    throw new Error("Invalid legal document list from server");
  }

  return parsed.data;
}

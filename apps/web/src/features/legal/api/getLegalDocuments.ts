import type { Database } from "@pickle/contracts";
import {
  type LegalDocument,
  type LegalDocumentType,
  legalDocumentSchema,
} from "@pickle/contracts/src/legal";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/shared/lib/supabase/client";

/**
 * 특정 유형의 모든 약관 버전 목록을 가져옵니다. (최신순)
 */
export const getLegalDocuments = async (
  type: LegalDocumentType,
  client?: SupabaseClient<Database>,
): Promise<LegalDocument[]> => {
  const supabase = client ?? createClient();

  const { data, error } = await supabase
    .from("legal_documents")
    .select("*")
    .eq("type", type)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const parsed = legalDocumentSchema.array().safeParse(data);
  const { logger } = await import("@/shared/lib/logger");

  if (!parsed.success) {
    logger.error(`[Legal] List validation failed for type: ${type}`, {
      error: parsed.error,
    });
    throw new Error("Invalid legal document list from server");
  }

  return parsed.data;
};

import type { Database } from "@pickle/contracts";
import {
  type LegalDocument,
  type LegalDocumentType,
  legalDocumentSchema,
} from "@pickle/contracts/src/legal";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/shared/lib/supabase/client";

/**
 * 특정 유형의 현재 활성화된 약관을 가져옵니다.
 */
export const getActiveLegalDocument = async (
  type: LegalDocumentType,
  client?: SupabaseClient<Database>,
): Promise<LegalDocument> => {
  const supabase = client ?? createClient();

  const { data, error } = await supabase
    .from("legal_documents")
    .select("*")
    .eq("type", type)
    .eq("is_active", true)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      throw new Error(`No active legal document found for type: ${type}`);
    }
    throw new Error(error.message);
  }

  const parsed = legalDocumentSchema.safeParse(data);
  const { logger } = await import("@/shared/lib/logger");

  if (!parsed.success) {
    logger.error(`[Legal] Validation failed for type: ${type}`, {
      error: parsed.error,
    });
    throw new Error("Invalid legal document data from server");
  }

  return parsed.data;
};

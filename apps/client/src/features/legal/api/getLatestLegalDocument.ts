import type {
  LegalDocument,
  LegalDocumentType,
} from "@pickle/contracts/src/legal";
import { legalDocumentSchema } from "@pickle/contracts/src/legal";
import { createClient } from "@/shared/lib/supabase";

/**
 * 특정 유형의 최신 약관 하나를 가져옵니다.
 */
export async function getLatestLegalDocument(
  type: LegalDocumentType,
): Promise<LegalDocument | null> {
  const supabase = createClient();

  // 최신 버전 하나만 조회
  const { data, error } = await supabase
    .from("legal_documents")
    .select("*")
    .eq("type", type)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) return null;

  const parsed = legalDocumentSchema.safeParse(data);

  if (!parsed.success) {
    return null;
  }

  return parsed.data;
}

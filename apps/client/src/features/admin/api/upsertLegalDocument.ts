import type { TablesInsert } from "@pickle/contracts";
import type { LegalDocument } from "@pickle/contracts/src/legal";
import { createClient } from "@/shared/lib/supabase";

/**
 * 약관 데이터를 업서트(저장 또는 수정)합니다.
 * 관리자 권한은 Supabase RLS에서 검증됩니다.
 *
 * 원본(web)은 Next.js Server Action이었으나,
 * client(Vite SPA)에서는 클라이언트 사이드 Supabase 호출로 전환.
 */
export async function upsertLegalDocument(
  payload: Partial<LegalDocument>,
): Promise<LegalDocument> {
  const supabase = createClient();

  // 활성화 설정 시 동일 타입의 다른 약관을 비활성화
  if (payload.is_active && payload.type) {
    await supabase
      .from("legal_documents")
      .update({ is_active: false })
      .eq("type", payload.type)
      .not("id", "is", null);
  }

  const upsertData = {
    ...payload,
    updated_at: new Date().toISOString(),
  } as TablesInsert<"legal_documents">;

  const { data, error } = await supabase
    .from("legal_documents")
    .upsert(upsertData)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as LegalDocument;
}

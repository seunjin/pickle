"use server";

import type { TablesInsert } from "@pickle/contracts";
import type { LegalDocument } from "@pickle/contracts/src/legal";
import { revalidatePath } from "next/cache";
import { createClient } from "@/shared/lib/supabase/server";

/**
 * 약관 데이터를 업서트(저장 또는 수정)합니다.
 * 관리자 권한이 필요합니다 (RLS에서 검증).
 */
export const upsertLegalDocument = async (payload: Partial<LegalDocument>) => {
  const supabase = await createClient();

  // 활성화 설정을 하는 경우, 동일 타입의 다른 약관들을 비활성화해야 함
  if (payload.is_active && payload.type) {
    await supabase
      .from("legal_documents")
      .update({ is_active: false })
      .eq("type", payload.type)
      .not("id", "is", null);
  }

  // 필수 필드가 누락되었을 수 있으므로 Insert 타입으로 변환 시 주의
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

  // 약관 내용이 캐시될 수 있으므로 관련 경로 무효화
  revalidatePath("/legal");
  revalidatePath("/admin/legal");

  return data;
};

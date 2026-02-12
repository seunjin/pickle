import type { Database } from "@pickle/contracts";
import type { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/shared/lib/logger";

/**
 * (Admin) 베타 신청을 승인합니다.
 * 화이트리스트(allowed_emails)에 등록하고 신청 상태를 approved로 변경합니다.
 */
export const approveApplication = async (
  supabase: SupabaseClient<Database>,
  params: { id: string; email: string },
) => {
  const { id, email } = params;

  // 1. 화이트리스트(allowed_emails)에 추가
  const { error: allowedError } = await supabase
    .from("allowed_emails")
    .insert({ email });

  if (allowedError && allowedError.code !== "23505") {
    // 이미 존재하면 무시
    logger.error("Failed to add email to allowed_emails", {
      email,
      error: allowedError,
    });
    throw new Error("화이트리스트 등록 중 오류가 발생했습니다.");
  }

  // 2. 신청 상태 업데이트
  const { error: appError } = await supabase
    .from("beta_applications")
    .update({ status: "approved" })
    .eq("id", id);

  if (appError) {
    logger.error("Failed to update beta application status to approved", {
      id,
      error: appError,
    });
    throw new Error("신청 상태 업데이트 중 오류가 발생했습니다.");
  }

  return { success: true };
};

import type { Database } from "@pickle/contracts";
import type { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/shared/lib/logger";

/**
 * (Admin) 접수된 신청 상태를 approved로 변경합니다.
 */
export const approveApplication = async (
  supabase: SupabaseClient<Database>,
  params: { id: string; email: string },
) => {
  const { id } = params;

  const { error: appError } = await supabase
    .from("beta_applications")
    .update({ status: "approved" })
    .eq("id", id);

  if (appError) {
    logger.error("Failed to update application status to approved", {
      id,
      error: appError,
    });
    throw new Error("신청 상태 업데이트 중 오류가 발생했습니다.");
  }

  return { success: true };
};

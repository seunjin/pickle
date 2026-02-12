import type { Database } from "@pickle/contracts";
import type { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/shared/lib/logger";

/**
 * (Admin) 베타 신청을 거절합니다.
 */
export const rejectApplication = async (
  supabase: SupabaseClient<Database>,
  params: { id: string },
) => {
  const { id } = params;

  const { error } = await supabase
    .from("beta_applications")
    .update({ status: "rejected" })
    .eq("id", id);

  if (error) {
    logger.error("Failed to reject beta application", { id, error });
    throw new Error("거절 처리 중 오류가 발생했습니다.");
  }

  return { success: true };
};

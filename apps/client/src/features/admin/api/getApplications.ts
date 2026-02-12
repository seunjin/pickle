import type { Database } from "@pickle/contracts";
import type { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/shared/lib/logger";

/**
 * (Admin) 베타 신청 목록을 가져옵니다.
 */
export const getApplications = async (supabase: SupabaseClient<Database>) => {
  const { data, error } = await supabase
    .from("beta_applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    logger.error("Failed to get beta applications", { error });
    throw error;
  }

  return data;
};

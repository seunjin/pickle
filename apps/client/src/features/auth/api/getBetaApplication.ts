import { createClient } from "@/shared/lib/supabase";

/**
 * 현재 사용자의 신청 내역을 조회합니다. (RLS 정책 필요)
 */
export const getBetaApplication = async (email: string) => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("beta_applications")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    console.error("[getApplication] Error:", error);
    return null;
  }

  return data;
};

import { logger } from "@/shared/lib/logger";
import { createClient } from "@/shared/lib/supabase/client";

export async function completeSignup(params: {
  marketing_agreed: boolean;
  is_over_14: boolean;
}) {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("complete_signup", {
    marketing_agreed: params.marketing_agreed,
    is_over_14: params.is_over_14,
  });

  if (error) {
    logger.error("Failed to complete signup", { error });
    throw error;
  }

  return data;
}

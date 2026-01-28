import { logger } from "@/shared/lib/logger";
import { createClient } from "@/shared/lib/supabase/client";

interface SignupResponse {
  status: "success" | "error";
  message?: string;
  detail?: string;
  hint?: string;
}

export async function completeSignup(params: {
  marketing_agreed: boolean;
  is_over_14: boolean;
}) {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("complete_signup", {
    p_marketing_agreed: params.marketing_agreed,
    p_is_over_14: params.is_over_14,
  });

  if (error) {
    logger.error("Failed to call complete_signup rpc", { error });
    throw error;
  }

  const response = data as unknown as SignupResponse;

  if (response && response.status === "error") {
    logger.error("Signup RPC internal error", {
      message: response.message,
      detail: response.detail,
      hint: response.hint,
    });
    throw new Error(`${response.message} (${response.detail})`);
  }

  return response;
}

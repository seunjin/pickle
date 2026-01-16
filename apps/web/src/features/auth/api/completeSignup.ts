import { createClient } from "@/shared/lib/supabase/client";

export async function completeSignup(params: { marketing_agreed: boolean }) {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("complete_signup", {
    marketing_agreed: params.marketing_agreed,
  });

  if (error) {
    console.error("Failed to complete signup:", error);
    throw error;
  }

  return data;
}

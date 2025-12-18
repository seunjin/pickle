import type { AppUser, Database } from "@pickle/contracts";
import type { SupabaseClient } from "@supabase/supabase-js";

export const getUser = async (
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<AppUser | null> => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    if (error.code !== "PGRST116") {
      // PGRST116 is JSON object requested, multiple (or no) rows returned
      console.error("Error fetching user:", error);
    }
    return null;
  }

  // Cast or validte if needed, but AppUser aligns with DB now (with satisfies check)
  return data as unknown as AppUser;
};

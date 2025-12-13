import type { Database, Profile } from "@pickle/contracts";
import type { SupabaseClient } from "@supabase/supabase-js";

export const getUserProfile = async (
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }

  return data;
};

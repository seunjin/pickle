import type { AppUser, Database } from "@pickle/contracts";
import type { SupabaseClient } from "@supabase/supabase-js";

export const updateUser = async (
  supabase: SupabaseClient<Database>,
  userId: string,
  updates: Partial<AppUser>,
): Promise<{ data: any; error: any }> => {
  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error updating user:", error);
  }

  return { data, error };
};

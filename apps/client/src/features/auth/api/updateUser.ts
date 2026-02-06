import type { AppUser, Database } from "@pickle/contracts";
import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/shared/lib/logger";

export const updateUser = async (
  supabase: SupabaseClient<Database>,
  userId: string,
  updates: Partial<AppUser>,
): Promise<{ data: AppUser | null; error: PostgrestError | null }> => {
  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    logger.error("Error updating user", { userId, error });
  }

  return { data: data as AppUser | null, error };
};

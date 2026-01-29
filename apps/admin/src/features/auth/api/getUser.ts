import { type AppUser, appUserSchema, type Database } from "@pickle/contracts";
import type { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/shared/lib/logger";

export const getUser = async (
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<AppUser | null> => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    if (error.code !== "PGRST116") {
      logger.error("Error fetching user", { userId, error });
    }
    return null;
  }

  if (!data) return null;

  const result = appUserSchema.safeParse(data);

  if (!result.success) {
    logger.warn("User data validation failed", { userId, error: result.error });
    return null;
  }

  return result.data;
};

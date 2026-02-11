import { type AppUser, appUserSchema, type Database } from "@pickle/contracts";
import type { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/shared/lib/logger";

export const getUser = async (
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<AppUser | null> => {
  logger.debug("Fetching user from DB...", { userId });

  // 쿼리가 멈추는 현상을 방지하기 위해 3초 타임아웃 적용
  const fetchPromise = supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Database Query Timeout (3s)")), 3000),
  );

  let result_db: any;
  try {
    result_db = (await Promise.race([fetchPromise, timeoutPromise])) as any;
  } catch (err) {
    console.error("[getUser] DB Fetch failed or timed out:", err);
    throw err; // 리턴 null 대신 에러를 던져서 SessionProvider가 로딩 상태를 유지하도록 함
  }

  const { data, error } = result_db;
  logger.debug("DB response received", {
    hasData: !!data,
    hasError: !!error,
  });

  if (error) {
    if (error.code !== "PGRST116") {
      logger.error("Error fetching user", { userId, error });
    }
    return null;
  }

  if (!data) return null;

  logger.debug("Raw user data from DB", data);
  const result = appUserSchema.safeParse(data);

  if (!result.success) {
    console.warn(
      "[getUser] User data validation failed for ID:",
      userId,
      "Errors:",
      result.error.format(),
    );
    logger.warn("User data validation failed", { userId, error: result.error });
    return null;
  }

  return result.data;
};

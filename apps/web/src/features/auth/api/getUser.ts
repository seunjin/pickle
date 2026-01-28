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
      // PGRST116: JSON 객체 반환을 요청했으나 결과가 없거나 여러 개일 때 발생하는 에러
      logger.error("Error fetching user", { userId, error });
    }
    return null;
  }

  if (!data) return null;

  // Zod 스키마를 사용하여 런타임 검증을 수행합니다.
  // DB의 text 타입과 AppUser의 Enum 타입 간 불일치를 안전하게 변환합니다.
  const result = appUserSchema.safeParse(data);

  if (!result.success) {
    logger.warn("User data validation failed", { userId, error: result.error });
    return null;
  }

  return result.data;
};

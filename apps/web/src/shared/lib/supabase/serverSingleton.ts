import { cache } from "react";
import { createClient } from "./server";

/**
 * React cache를 사용한 Supabase client singleton
 *
 * 동일한 서버 요청 내에서 createClient()가 여러 번 호출되어도
 * 동일한 인스턴스를 반환하여 인증 일관성 보장
 */
export const getSupabaseServerClient = cache(async () => {
  return createClient();
});

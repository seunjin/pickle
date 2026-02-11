import type { Database } from "@pickle/contracts";
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase URL or Anon Key not found in Environment Variables",
    );
  }

  // 로컬 개발 환경에서 cookieOptions의 복잡한 설정이 세션 갱신/조회를 방해할 수 있으므로
  // 최소한의 설정만 남기거나 기본값을 사용하도록 단순화합니다.
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookieOptions: {
      domain: import.meta.env.VITE_COOKIE_DOMAIN,
      path: "/",
    },
  });
}

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

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookieOptions: {
      // 로컬 개발 시에는 기본값 사용, 배포 시에는 .pickle.com 등으로 설정 필요
      // import.meta.env.VITE_COOKIE_DOMAIN || undefined
      domain: import.meta.env.VITE_COOKIE_DOMAIN,
      path: "/",
      sameSite: "lax",
      secure: true,
    },
  });
}

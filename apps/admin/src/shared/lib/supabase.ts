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

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

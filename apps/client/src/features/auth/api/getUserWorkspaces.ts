import type { Database, Workspace } from "@pickle/contracts";
import type { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/shared/lib/logger";

export async function getUserWorkspaces(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<Workspace[]> {
  console.log("[getUserWorkspaces] Fetching workspaces from DB...", userId);
  const { data, error } = await supabase
    .from("workspace_members")
    .select("workspaces (*)")
    .eq("user_id", userId);
  console.log("[getUserWorkspaces] DB response received:", { count: data?.length, hasError: !!error });

  if (error) {
    logger.error("Error fetching workspaces", { userId, error });
    return [];
  }

  if (!data) return [];

  const workspaces = data
    .map((row) => row.workspaces)
    .filter((ws): ws is Workspace => ws !== null);

  return workspaces;
}

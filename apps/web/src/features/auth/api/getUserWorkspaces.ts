import type { Database, Workspace } from "@pickle/contracts";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function getUserWorkspaces(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<Workspace[]> {
  // workspace_members 테이블을 조인하여 사용자가 소속된 *모든* 워크스페이스를 가져옵니다.
  const { data, error } = await supabase
    .from("workspace_members")
    .select("workspaces (*)")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching workspaces:", error);
    return [];
  }

  if (!data) return [];

  // data는 { workspaces: Workspace | null | ... }[] 형태입니다.
  // null이 아닌 workspaces만 추출하여 플랫한 배열로 만듭니다.
  const workspaces = data
    .map((row) => row.workspaces)
    .filter((ws): ws is Workspace => ws !== null);

  return workspaces;
}

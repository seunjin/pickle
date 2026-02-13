import type { Database, Tag } from "@pickle/contracts";
import { tagSchema } from "@pickle/contracts/src/tag";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/shared/lib/supabase";

export async function getTags({
  client,
  workspaceId,
}: {
  client?: SupabaseClient<Database>;
  workspaceId?: string;
} = {}): Promise<Tag[]> {
  const supabase = client ?? createClient();
  let targetWorkspaceId = workspaceId;

  // ✅ RLS 패턴: workspaceId가 없으면 직접 조회하여 인증 상태 확인
  if (!targetWorkspaceId || targetWorkspaceId === "") {
    const { data: workspace } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .limit(1)
      .single();

    if (!workspace) return [];
    targetWorkspaceId = workspace.workspace_id;
  }

  const { data, error } = await supabase
    .from("tags")
    .select("*, note_tags:note_tags(count)")
    .eq("workspace_id", targetWorkspaceId)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data.map((tag) => {
    const parsed = tagSchema.parse(tag);
    return {
      ...parsed,
      totalCount: (tag.note_tags as any)?.[0]?.count || 0,
    };
  });
}

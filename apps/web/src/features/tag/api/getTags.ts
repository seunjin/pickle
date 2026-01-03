import type { Tag } from "@pickle/contracts";
import { createClient } from "@/shared/lib/supabase/client";

export async function getTags(workspaceId: string): Promise<Tag[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data as Tag[];
}

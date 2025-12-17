import type { Asset } from "@pickle/contracts/src/asset";
import type { Note } from "@pickle/contracts/src/note";
import { createClient } from "@/shared/lib/supabase/client";

export type NoteWithAsset = Note & { assets: Asset | null };

export const getNotes = async (): Promise<NoteWithAsset[]> => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // 1. Get User's Workspace
  // TODO: Support multiple workspaces (currently fetches the first one)
  const { data: workspace } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!workspace) return [];

  // 2. Fetch Notes with Assets
  const { data, error } = await supabase
    .from("notes")
    .select("*, assets(*)")
    .eq("workspace_id", workspace.workspace_id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    throw new Error(error.message);
  }

  // Type assertion for joined data
  return data as unknown as NoteWithAsset[];
};

import type { Database } from "@pickle/contracts";
import type { CreateNoteInput, Note } from "@pickle/contracts/src/note";
import { createClient } from "@/shared/lib/supabase/client";

export const createNote = async (newNote: CreateNoteInput): Promise<Note> => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // 1. Get User's Workspace
  const { data: workspace } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!workspace) throw new Error("No Workspace Found");

  const insertPayload: Database["public"]["Tables"]["notes"]["Insert"] = {
    workspace_id: workspace.workspace_id,
    user_id: user.id,
    type: newNote.type,
    url: newNote.url,
    content: newNote.content ?? null,
    data: newNote.data,
    tags: newNote.tags ?? [],
  };

  const { data, error } = await supabase
    .from("notes")
    .insert(insertPayload)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

import { createClient } from "@/shared/lib/supabase/client";

export async function addTagToNote(
  noteId: string,
  tagId: string,
): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from("note_tags")
    .insert({ note_id: noteId, tag_id: tagId });

  if (error) {
    // 이미 존재하는 관계인 경우 (PGRST116 또는 Unique Constraint Violation) 무시할지 결정
    if (error.code === "23505") return true;
    throw new Error(error.message);
  }

  return true;
}

export async function removeTagFromNote(
  noteId: string,
  tagId: string,
): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from("note_tags")
    .delete()
    .eq("note_id", noteId)
    .eq("tag_id", tagId);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}

import type { UpdateNoteInput } from "@pickle/contracts/src/note";
import { createClient } from "@/shared/lib/supabase/client";

/**
 * 노트를 업데이트합니다.
 */
export async function updateNote(noteId: string, payload: UpdateNoteInput) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("notes")
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", noteId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

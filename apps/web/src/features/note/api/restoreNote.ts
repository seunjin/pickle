import { createClient } from "@/shared/lib/supabase/client";

/**
 * 휴지통의 노트를 복원합니다. (deleted_at을 null로 설정)
 */
export async function restoreNote(noteId: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from("notes")
    .update({ deleted_at: null })
    .eq("id", noteId);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}

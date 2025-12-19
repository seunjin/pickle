import { createClient } from "@/shared/lib/supabase/client";

export async function deleteNote(noteId: string) {
  const supabase = createClient();

  const { error } = await supabase.from("notes").delete().eq("id", noteId);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}

import type { Database } from "@pickle/contracts";
import type { CreateNoteInput, Note } from "@pickle/contracts/src/note";
import { createClient } from "@/shared/lib/supabase/client";

export const createNote = async (newNote: CreateNoteInput): Promise<Note> => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const insertPayload: Database["public"]["Tables"]["notes"]["Insert"] = {
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

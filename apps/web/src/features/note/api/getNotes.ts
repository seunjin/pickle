import type { Note } from "@pickle/contracts/src/note";
import { createClient } from "@/shared/lib/supabase/client";

export const getNotes = async (): Promise<Note[]> => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    throw new Error(error.message);
  }

  return data as Note[];
};

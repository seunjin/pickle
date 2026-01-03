import type { Database } from "@pickle/contracts";
import {
  type NoteWithAsset,
  noteWithAssetSchema,
} from "@pickle/contracts/src/note";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/shared/lib/supabase/client";

export const getNote = async (
  noteId: string,
  client?: SupabaseClient<Database>,
): Promise<NoteWithAsset> => {
  const supabase = client ?? createClient();

  const { data, error } = await supabase
    .from("notes")
    .select(`
      *,
      assets(*),
      tag_list:note_tags(
        tag:tags(*)
      )
    `)
    .eq("id", noteId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // 데이터 평탄화
  const transformedData = {
    ...data,
    tag_list: data.tag_list?.map((item: any) => item.tag).filter(Boolean) || [],
  };

  const parsed = noteWithAssetSchema.safeParse(transformedData);

  if (!parsed.success) {
    console.error("Note fetch validation failed:", parsed.error);
    throw new Error("Invalid note data from server");
  }

  return parsed.data;
};

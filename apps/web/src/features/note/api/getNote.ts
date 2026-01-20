import type { Database } from "@pickle/contracts";
import {
  type NoteWithAsset,
  noteWithAssetSchema,
} from "@pickle/contracts/src/note";
import type { Tag } from "@pickle/contracts/src/tag";
import type { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/shared/lib/logger";
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
    tag_list:
      (data.tag_list as { tag: Tag | null }[] | null)
        ?.map((item) => item.tag)
        .filter(Boolean) || [],
  };

  const parsed = noteWithAssetSchema.safeParse(transformedData);

  if (!parsed.success) {
    logger.error("Note fetch validation failed", {
      noteId,
      error: parsed.error,
    });
    throw new Error("Invalid note data from server");
  }

  return parsed.data;
};

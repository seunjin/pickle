import type { Tag, UpdateTagInput } from "@pickle/contracts";
import { createClient } from "@/shared/lib/supabase/client";

export async function updateTag(
  tagId: string,
  input: UpdateTagInput,
): Promise<Tag> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("tags")
    .update(input)
    .eq("id", tagId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Tag;
}

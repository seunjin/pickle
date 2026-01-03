import type { CreateTagInput, Tag } from "@pickle/contracts";
import { createClient } from "@/shared/lib/supabase/client";

export async function createTag(input: CreateTagInput): Promise<Tag> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("tags")
    .insert(input)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Tag;
}

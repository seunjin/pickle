import { createClient } from "@/shared/lib/supabase/client";

export async function deleteTag(tagId: string): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase.from("tags").delete().eq("id", tagId);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}

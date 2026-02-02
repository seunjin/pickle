import type { Database } from "@pickle/contracts";
import type { UpdateFolderDto } from "@pickle/contracts/src/folder";
import { folderSchema } from "@pickle/contracts/src/folder";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function updateFolder({
  client,
  folderId,
  input,
}: {
  client: SupabaseClient<Database>;
  folderId: string;
  input: UpdateFolderDto;
}) {
  const { data, error } = await client
    .from("folders")
    .update(input)
    .eq("id", folderId)
    .select()
    .single();

  if (error) throw error;

  return folderSchema.parse(data);
}

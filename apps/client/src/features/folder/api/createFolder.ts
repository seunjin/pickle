import type { Database } from "@pickle/contracts";
import type { CreateFolderDto } from "@pickle/contracts/src/folder";
import { folderSchema } from "@pickle/contracts/src/folder";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function createFolder({
  client,
  input,
  workspaceId,
}: {
  client: SupabaseClient<Database>;
  input: CreateFolderDto;
  workspaceId: string;
}) {
  const { data, error } = await client
    .from("folders")
    .insert({
      ...input,
      workspace_id: workspaceId,
    })
    .select()
    .single();

  if (error) throw error;

  return folderSchema.parse(data);
}

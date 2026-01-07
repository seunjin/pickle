import type { Database } from "@pickle/contracts";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function deleteFolder({
  client,
  folderId,
}: {
  client: SupabaseClient<Database>;
  folderId: string;
}) {
  const { error } = await client.from("folders").delete().eq("id", folderId);

  if (error) throw error;
}

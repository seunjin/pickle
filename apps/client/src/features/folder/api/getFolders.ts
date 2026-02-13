import type { Database } from "@pickle/contracts";
import { folderSchema } from "@pickle/contracts/src/folder";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function getFolders({
  client,
}: {
  client: SupabaseClient<Database>;
}) {
  const { data, error } = await client
    .from("folders")
    .select("*, notes:notes(count)")
    .is("deleted_at", null)
    .is("notes.deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data.map((folder) => {
    const parsed = folderSchema.parse(folder);
    return {
      ...parsed,
      totalCount: (folder.notes as any)?.[0]?.count || 0,
    };
  });
}

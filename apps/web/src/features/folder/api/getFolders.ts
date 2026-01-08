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
    .select("*")
    .is("deleted_at", null) // ✅ 삭제된 폴더 제외
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data.map((folder) => folderSchema.parse(folder));
}

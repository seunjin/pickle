import type { Database } from "@pickle/contracts";
import type { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/shared/lib/logger";

export async function deleteFolder({
  client,
  folderId,
}: {
  client: SupabaseClient<Database>;
  folderId: string;
}) {
  // 1. 폴더 내의 노트들도 모두 휴지통으로 이동 (Soft Delete)
  const { error: notesError } = await client
    .from("notes")
    .update({
      deleted_at: new Date().toISOString(),
      bookmarked_at: null, // ✅ 휴지통 이동 시 북마크 해제
    })
    .eq("folder_id", folderId);

  if (notesError) {
    logger.error("Failed to move folder notes to trash", {
      folderId,
      error: notesError,
    });
  }

  // 2. 폴더 자체를 소프트 딜리트
  const { error } = await client
    .from("folders")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", folderId);

  if (error) throw error;
}

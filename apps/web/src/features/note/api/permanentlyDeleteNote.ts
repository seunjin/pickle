import { logger } from "@/shared/lib/logger";
import { createClient } from "@/shared/lib/supabase/client";

/**
 * 노트를 영구 삭제합니다. Storage의 파일도 함께 삭제됩니다.
 */
export async function permanentlyDeleteNote(noteId: string) {
  const supabase = createClient();

  // 1. 먼저 노트와 연관된 asset 정보 조회
  const { data: note } = await supabase
    .from("notes")
    .select("asset_id, assets(full_path)")
    .eq("id", noteId)
    .single();

  // 2. Storage 파일 삭제 (asset이 있는 경우)
  if (note?.assets?.full_path) {
    const { error: storageError } = await supabase.storage
      .from("bitmaps")
      .remove([note.assets.full_path]);

    if (storageError) {
      logger.error("Failed to delete storage file in permanent delete", {
        noteId,
        error: storageError,
      });
    }
  }

  // 3. 노트 영구 삭제 (DB에서 실제 삭제)
  const { error } = await supabase.from("notes").delete().eq("id", noteId);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}

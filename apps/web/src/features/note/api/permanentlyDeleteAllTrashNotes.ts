import { logger } from "@/shared/lib/logger";
import { createClient } from "@/shared/lib/supabase/client";

/**
 * 휴지통의 모든 노트를 영구 삭제합니다.
 */
export async function permanentlyDeleteAllTrashNotes() {
  const supabase = createClient();

  // 1. 휴지통의 모든 노트와 asset 정보 조회
  const { data: trashNotes } = await supabase
    .from("notes")
    .select("id, asset_id, assets(full_path)")
    .not("deleted_at", "is", null);

  if (!trashNotes || trashNotes.length === 0) return true;

  // 2. Storage 파일들 삭제
  const fullPaths = trashNotes
    .map((n) => n.assets?.full_path)
    .filter(Boolean) as string[];

  if (fullPaths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from("bitmaps")
      .remove(fullPaths);

    if (storageError) {
      logger.error("Failed to delete storage files in empty trash", {
        error: storageError,
      });
    }
  }

  // 3. 노트들 영구 삭제
  const noteIds = trashNotes.map((n) => n.id);
  const { error } = await supabase.from("notes").delete().in("id", noteIds);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}

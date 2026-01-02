import { createClient } from "@/shared/lib/supabase/client";

/**
 * 노트와 연관된 Storage 파일을 함께 삭제합니다.
 *
 * TODO: [Performance] 현재 클라이언트에서 Storage 파일을 삭제하고 있지만,
 * 향후 Supabase Edge Function 또는 pg_net extension을 활용한
 * DB 트리거 방식으로 전환하면 더 안정적인 삭제가 가능합니다.
 * 참고: https://supabase.com/docs/guides/storage/uploads/resumable-uploads#delete-file-on-row-delete
 */
export async function deleteNote(noteId: string) {
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
      console.error("Failed to delete storage file:", storageError);
      // Storage 삭제 실패해도 DB 삭제는 진행 (파일만 고아 상태로 남음)
    }
  }

  // 3. 노트 삭제 (assets는 DB 트리거 `on_note_deleted`에서 자동 삭제)
  const { error } = await supabase.from("notes").delete().eq("id", noteId);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}

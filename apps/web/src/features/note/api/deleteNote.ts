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

  // 3. 노트 소프트 딜리트 (휴지통으로 이동)
  const { error } = await supabase
    .from("notes")
    .update({
      deleted_at: new Date().toISOString(),
      bookmarked_at: null, // ✅ 휴지통 이동 시 북마크 해제
    })
    .eq("id", noteId);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}

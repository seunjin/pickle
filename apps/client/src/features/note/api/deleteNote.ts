import { createClient } from "@/shared/lib/supabase";

/**
 * 노트를 소프트 딜리트 (휴지통으로 이동) 합니다.
 */
export async function deleteNote(noteId: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from("notes")
    .update({
      deleted_at: new Date().toISOString(),
      bookmarked_at: null, // 휴지통 이동 시 북마크 해제
    })
    .eq("id", noteId);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}

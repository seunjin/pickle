import { createClient } from "@/shared/lib/supabase/client";

export async function addTagToNote(
  noteId: string,
  tagId: string,
): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from("note_tags")
    .insert({ note_id: noteId, tag_id: tagId });

  if (error) {
    // 이미 존재하는 관계인 경우 (PGRST116 또는 Unique Constraint Violation) 무시할지 결정
    if (error.code === "23505") return true;
    throw new Error(error.message);
  }

  return true;
}

export async function removeTagFromNote(
  noteId: string,
  tagId: string,
): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from("note_tags")
    .delete()
    .eq("note_id", noteId)
    .eq("tag_id", tagId);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}

/**
 * 노트의 태그 목록을 일괄 업데이트합니다.
 * 기존 관계를 모두 제거하고 새로운 태그 ID 리스트로 대체합니다.
 */
export async function setNoteTags(
  noteId: string,
  tagIds: string[],
): Promise<boolean> {
  const supabase = createClient();

  // 1. 기존 태그 관계 삭제
  const { error: deleteError } = await supabase
    .from("note_tags")
    .delete()
    .eq("note_id", noteId);

  if (deleteError) throw new Error(deleteError.message);

  // 2. 새로운 태그 관계 추가 (리스트가 비어있지 않은 경우)
  if (tagIds.length > 0) {
    const { error: insertError } = await supabase.from("note_tags").insert(
      tagIds.map((tagId) => ({
        note_id: noteId,
        tag_id: tagId,
      })),
    );

    if (insertError) throw new Error(insertError.message);
  }

  return true;
}

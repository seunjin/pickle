/**
 * Supabase에서 조회한 노트 데이터의 tag_list 필드를 정규화합니다.
 *
 * Supabase 조인 쿼리는 `tag_list: note_tags(tag: tags(*))` 형태로 반환되며,
 * 이 함수는 중첩된 `{ tag: Tag }[]` 구조를 `Tag[]` 배열로 평탄화합니다.
 *
 * @param data - Supabase 쿼리 결과 (raw data)
 * @returns 정규화된 노트 데이터 배열
 *
 * @example
 * const { data } = await supabase.from("notes").select(selectQuery);
 * const transformedData = transformNoteTagList(data);
 */
export function transformNoteTagList(
  data: unknown[] | null,
): Array<Record<string, unknown>> | null {
  if (!data || !Array.isArray(data)) return null;

  return data.map((item) => {
    const note = item as Record<string, unknown>;
    const tagList = note.tag_list;

    // tag_list가 없거나 배열이 아닌 경우 빈 배열로 설정
    if (!Array.isArray(tagList)) {
      return { ...note, tag_list: [] };
    }

    // 중첩된 { tag: Tag } 구조를 Tag 배열로 평탄화
    const flattenedTags = tagList
      .map((tagItem: unknown) => {
        if (
          typeof tagItem === "object" &&
          tagItem !== null &&
          "tag" in tagItem
        ) {
          return (tagItem as { tag: unknown }).tag;
        }
        return null;
      })
      .filter(Boolean);

    return { ...note, tag_list: flattenedTags };
  });
}

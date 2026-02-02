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

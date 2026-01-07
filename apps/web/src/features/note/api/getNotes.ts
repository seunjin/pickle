import type { Database } from "@pickle/contracts";
import {
  type NoteWithAsset,
  noteWithAssetSchema,
} from "@pickle/contracts/src/note";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/shared/lib/supabase/client";

export interface GetNotesParams {
  client?: SupabaseClient<Database>;
  filter?: {
    onlyBookmarked?: boolean;
    folderId?: string | null; // ✅ 폴더 필터
    tagId?: string; // ✅ 태그 필터 추가
    type?: NoteWithAsset["type"];
  };
}

export const getNotes = async (
  params: GetNotesParams = {},
): Promise<NoteWithAsset[]> => {
  const { client, filter } = params;
  const supabase = client ?? createClient();

  // ✅ RLS 패턴: workspace_members 조회로 인증 상태 확인
  const { data: workspace } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .limit(1)
    .single();

  if (!workspace) return [];

  // 1. SELECT 절 구성 (태그 필터링 여부에 따라 동적 변경)
  // !inner 조인을 사용하면 해당 관계가 존재하는 행만 남습니다.
  const selectQuery = `
    *,
    assets(*),
    note_tags${filter?.tagId ? "!inner" : ""}(
      tag_id
    ),
    tag_list:note_tags(
      tag:tags(*)
    )
  `;

  // 2. 쿼리 빌더 생성
  let query = supabase
    .from("notes")
    .select(selectQuery)
    .eq("workspace_id", workspace.workspace_id);

  // 3. 필터링 및 정렬 적용
  if (filter?.tagId) {
    query = query.eq("note_tags.tag_id", filter.tagId);
  }

  if (filter?.onlyBookmarked) {
    query = query.not("bookmarked_at", "is", null);
  }

  if (filter?.type) {
    query = query.eq("type", filter.type);
  }

  // ✅ 폴더 필터링
  if (filter?.folderId !== undefined) {
    if (filter.folderId === null) {
      query = query.is("folder_id", null);
    } else {
      query = query.eq("folder_id", filter.folderId);
    }
  }

  if (filter?.onlyBookmarked) {
    query = query.order("bookmarked_at", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data: notesData, error: notesError } = await query;

  if (notesError) {
    throw new Error(notesError.message);
  }

  // 중첩된 tag 구조를 평탄화 (tag_list: [{ tag: { ... } }] -> tag_list: [{ ... }])
  const transformedData = notesData?.map((note: any) => ({
    ...note,
    tag_list: note.tag_list?.map((item: any) => item.tag).filter(Boolean) || [],
  }));

  // Zod 스키마를 확장하여 Note + Assets + Tags 구조를 정의합니다.
  const parsed = noteWithAssetSchema.array().safeParse(transformedData);

  if (!parsed.success) {
    console.error("Notes fetch validation failed:", parsed.error.format());
    console.error("Failed raw data sample:", transformedData?.[0]);
    return [];
  }

  return parsed.data;
};

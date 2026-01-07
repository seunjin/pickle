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
    type?: NoteWithAsset["type"];
  };
}

export const getNotes = async (
  params: GetNotesParams = {},
): Promise<NoteWithAsset[]> => {
  const { client, filter } = params;
  const supabase = client ?? createClient();

  // ✅ RLS 패턴: workspace_members 조회로 인증 상태 확인
  // user_id = auth.uid() RLS 정책이 자동으로 현재 사용자만 필터링
  const { data: workspace } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .limit(1)
    .single();

  // 인증되지 않았거나 워크스페이스 없으면 빈 배열
  if (!workspace) return [];

  // 2. 쿼리 빌더 생성
  let query = supabase
    .from("notes")
    .select(`
      *,
      assets(*),
      tag_list:note_tags(
        tag:tags(*)
      )
    `)
    .eq("workspace_id", workspace.workspace_id);

  // 3. 필터링 및 정렬 적용
  if (filter?.onlyBookmarked) {
    query = query.not("bookmarked_at", "is", null);
  }

  if (filter?.type) {
    query = query.eq("type", filter.type);
  }

  // ✅ 폴더 필터링
  if (filter?.folderId !== undefined) {
    if (filter.folderId === null) {
      // Inbox: folder_id가 null인 노트
      query = query.is("folder_id", null);
    } else {
      // 특정 폴더의 노트
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

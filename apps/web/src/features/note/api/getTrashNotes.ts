import {
  type NoteWithAsset,
  noteWithAssetSchema,
} from "@pickle/contracts/src/note";
import { createClient as createBrowserClient } from "@/shared/lib/supabase/client";

/**
 * 휴지통에 있는 (deleted_at 이 존재하는) 노트 목록을 가져옵니다.
 */
export async function getTrashNotes(client?: any): Promise<NoteWithAsset[]> {
  const supabase = client ?? createBrowserClient();

  // ✅ RLS 패턴: workspace_members 조회로 인증 상태 확인
  const { data: workspace } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .limit(1)
    .single();

  if (!workspace) return [];

  const selectQuery = `
    *,
    assets(*),
    tag_list:note_tags(
      tag:tags(*)
    )
  `;

  const { data, error } = await supabase
    .from("notes")
    .select(selectQuery)
    .eq("workspace_id", workspace.workspace_id)
    .not("deleted_at", "is", null) // ✅ 휴지통 필터
    .order("deleted_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  // 평탄화 로직 (getNotes와 동일)
  const transformedData = data?.map((note: any) => ({
    ...note,
    tag_list: note.tag_list?.map((item: any) => item.tag).filter(Boolean) || [],
  }));

  const parsed = noteWithAssetSchema.array().safeParse(transformedData);
  return parsed.success ? parsed.data : [];
}

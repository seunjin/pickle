import type { Database } from "@pickle/contracts";
import {
  type NoteWithAsset,
  noteWithAssetSchema,
} from "@pickle/contracts/src/note";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/shared/lib/supabase/client";

export interface SearchNotesParams {
  client?: SupabaseClient<Database>;
  workspaceId?: string;
  query?: string;
  filter?: {
    type?: NoteWithAsset["type"];
    folderId?: string | null;
    tagIds?: string[];
  };
  sort?: "latest" | "oldest";
  signal?: AbortSignal;
}

export const searchNotes = async (
  params: SearchNotesParams = {},
): Promise<NoteWithAsset[]> => {
  const { client, query: q, filter, sort = "latest", signal } = params;
  const supabase = client ?? createClient();

  let currentWorkspaceId = params.workspaceId;

  if (!currentWorkspaceId) {
    const { data: workspace } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .limit(1)
      .single();

    if (!workspace) return [];
    currentWorkspaceId = workspace.workspace_id;
  }

  // 1. SELECT 절 구성
  // 다중 태그 필터링을 위해 note_tags 관계를 포함합니다.
  const selectQuery = `
    *,
    assets(*),
    tag_list:note_tags(
      tag:tags(*)
    )
  `;

  // 2. 쿼리 빌더 생성
  let query = supabase
    .from("notes")
    .select(selectQuery)
    .eq("workspace_id", currentWorkspaceId)
    .is("deleted_at", null);

  if (signal) {
    query = query.abortSignal(signal);
  }

  // 3. 필터링 적용

  // 텍스트 검색 (Full-Text Search)
  if (q && q.trim() !== "") {
    query = query.textSearch("fts_tokens", q, {
      config: "simple",
      type: "plain",
    });
  }

  // 타입 필터
  if (filter?.type) {
    if (filter.type === "image") {
      query = query.in("type", ["image", "capture"]);
    } else {
      query = query.eq("type", filter.type);
    }
  }

  // 폴더 필터
  if (filter?.folderId) {
    if (filter.folderId === "inbox") {
      query = query.is("folder_id", null);
    } else {
      query = query.eq("folder_id", filter.folderId);
    }
  }

  // 4. 데이터 조회 (태그 필터링은 클라이언트사이드 또는 추가 쿼리로 처리할 수 있으나,
  // 여기서는 성능을 위해 모든 노트를 가져온 후 클라이언트에서 필터링하거나
  // 복잡한 RPC 없이 기본적인 필터링만 수행합니다.)
  // 단, tagIds가 있는 경우 해당 태그를 모두 포함하는지 확인해야 합니다.

  const { data: notesData, error: notesError } = await query.order(
    "created_at",
    {
      ascending: sort === "oldest",
    },
  );

  if (notesError) {
    throw new Error(notesError.message);
  }

  // 5. 후처리 및 태그 멀티 필터링
  const transformedData = (
    notesData as unknown as Array<Record<string, unknown>> | null
  )?.map((note) => ({
    ...note,
    tag_list:
      (note.tag_list as Array<{ tag: unknown }> | undefined)
        ?.map((item) => item.tag)
        .filter(Boolean) || [],
  }));

  // 클라이언트 사이드 태그 멀티 필터링 (다중 태그 교집합)
  let filteredData = transformedData || [];
  if (filter?.tagIds && filter.tagIds.length > 0) {
    filteredData = filteredData.filter((note) => {
      const noteTagIds = (note.tag_list as Array<{ id: string }>).map(
        (t) => t.id,
      );
      return filter.tagIds?.every((id) => noteTagIds.includes(id));
    });
  }

  const parsed = noteWithAssetSchema.array().safeParse(filteredData);

  if (!parsed.success) {
    console.error(
      "Search notes fetch validation failed:",
      parsed.error.format(),
    );
    return [];
  }

  return parsed.data;
};

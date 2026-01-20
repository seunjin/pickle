import type { Database } from "@pickle/contracts";
import {
  type NoteWithAsset,
  noteWithAssetSchema,
} from "@pickle/contracts/src/note";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/shared/lib/supabase/client";
import { transformNoteTagList } from "../lib/transformNoteTagList";

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
  page?: number;
  pageSize?: number;
}

export const searchNotes = async (
  params: SearchNotesParams = {},
): Promise<{ notes: NoteWithAsset[]; totalCount: number }> => {
  const {
    client,
    query: q,
    filter,
    sort = "latest",
    signal,
    page,
    pageSize,
  } = params;
  const supabase = client ?? createClient();

  let currentWorkspaceId = params.workspaceId;

  if (!currentWorkspaceId) {
    const { data: workspace } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .limit(1)
      .single();

    if (!workspace) return { notes: [], totalCount: 0 };
    currentWorkspaceId = workspace.workspace_id;
  }

  // 1. SELECT 절 구성
  const selectQuery = `
    *,
    assets(*),
    tag_list:note_tags(
      tag:tags(*)
    )
  `;

  // 2. 쿼리 빌더 생성
  let queryBuilder = supabase
    .from("notes")
    .select(selectQuery, { count: "exact" })
    .eq("workspace_id", currentWorkspaceId)
    .is("deleted_at", null);

  if (signal) {
    queryBuilder = queryBuilder.abortSignal(signal);
  }

  // 3. 필터링 적용
  if (q && q.trim() !== "") {
    queryBuilder = queryBuilder.textSearch("fts_tokens", q, {
      config: "simple",
      type: "plain",
    });
  }

  if (filter?.type) {
    if (filter.type === "image") {
      queryBuilder = queryBuilder.in("type", ["image", "capture"]);
    } else {
      queryBuilder = queryBuilder.eq("type", filter.type);
    }
  }

  if (filter?.folderId) {
    if (filter.folderId === "inbox") {
      queryBuilder = queryBuilder.is("folder_id", null);
    } else {
      queryBuilder = queryBuilder.eq("folder_id", filter.folderId);
    }
  }

  // 4. 페이지네이션 및 정렬
  if (page !== undefined && pageSize !== undefined) {
    const from = page * pageSize;
    const to = from + pageSize - 1;
    queryBuilder = queryBuilder.range(from, to);
  }

  const {
    data: notesData,
    error: notesError,
    count,
  } = await queryBuilder.order("created_at", {
    ascending: sort === "oldest",
  });

  if (notesError) {
    throw new Error(notesError.message);
  }

  // 5. 후처리: tag_list 정규화
  const transformedData = transformNoteTagList(notesData);

  // 클라이언트 사이드 태그 멀티 필터링
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
    return { notes: [], totalCount: 0 };
  }

  return {
    notes: parsed.data,
    totalCount: count || 0,
  };
};

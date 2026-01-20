import type { Database } from "@pickle/contracts";
import {
  type NoteWithAsset,
  noteWithAssetSchema,
} from "@pickle/contracts/src/note";
import type { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/shared/lib/logger";
import { createClient } from "@/shared/lib/supabase/client";
import { transformNoteTagList } from "../lib/transformNoteTagList";

export interface GetNotesParams {
  client?: SupabaseClient<Database>;
  workspaceId?: string;
  filter?: {
    onlyBookmarked?: boolean;
    folderId?: string | null;
    tagId?: string;
    type?: NoteWithAsset["type"];
  };
  page?: number;
  pageSize?: number;
  sort?: "latest" | "oldest";
  signal?: AbortSignal;
}

export const getNotes = async (
  params: GetNotesParams = {},
): Promise<{ notes: NoteWithAsset[]; totalCount: number }> => {
  const { client, filter, page, pageSize, sort = "latest", signal } = params;
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
    note_tags${filter?.tagId ? "!inner" : ""}(
      tag_id
    ),
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

  // 3. 필터링 로직
  if (filter?.tagId) {
    queryBuilder = queryBuilder.eq("note_tags.tag_id", filter.tagId);
  }

  if (filter?.onlyBookmarked) {
    queryBuilder = queryBuilder.not("bookmarked_at", "is", null);
  }

  if (filter?.type) {
    if (filter.type === "image") {
      queryBuilder = queryBuilder.in("type", ["image", "capture"]);
    } else {
      queryBuilder = queryBuilder.eq("type", filter.type);
    }
  }

  if (filter?.folderId !== undefined) {
    if (filter.folderId === null) {
      queryBuilder = queryBuilder.is("folder_id", null);
    } else {
      queryBuilder = queryBuilder.eq("folder_id", filter.folderId);
    }
  }

  // 4. 정렬 및 페이지네이션
  if (filter?.onlyBookmarked) {
    queryBuilder = queryBuilder.order("bookmarked_at", {
      ascending: sort === "oldest",
    });
  } else {
    queryBuilder = queryBuilder.order("created_at", {
      ascending: sort === "oldest",
    });
  }

  if (page !== undefined && pageSize !== undefined) {
    const from = page * pageSize;
    const to = from + pageSize - 1;
    queryBuilder = queryBuilder.range(from, to);
  }

  const { data: notesData, error: notesError, count } = await queryBuilder;

  if (notesError) {
    throw new Error(notesError.message);
  }

  // 5. 후처리: tag_list 정규화
  const transformedData = transformNoteTagList(notesData);

  const parsed = noteWithAssetSchema.array().safeParse(transformedData);

  if (!parsed.success) {
    logger.error("Notes fetch validation failed", {
      error: parsed.error.format(),
    });
    return { notes: [], totalCount: 0 };
  }

  return {
    notes: parsed.data,
    totalCount: count || 0,
  };
};

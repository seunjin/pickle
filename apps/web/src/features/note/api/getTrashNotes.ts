import {
  type NoteWithAsset,
  noteWithAssetSchema,
} from "@pickle/contracts/src/note";
import { createClient as createBrowserClient } from "@/shared/lib/supabase/client";
import { transformNoteTagList } from "../lib/transformNoteTagList";

import type { GetNotesParams } from "./getNotes";

/**
 * 휴지통에 있는 (deleted_at 이 존재하는) 노트 목록을 가져옵니다.
 */
export async function getTrashNotes(
  params: GetNotesParams = {},
): Promise<{ notes: NoteWithAsset[]; totalCount: number }> {
  const { client, workspaceId, page, pageSize, signal } = params;
  const supabase = client ?? createBrowserClient();

  let currentWorkspaceId = workspaceId;

  if (!currentWorkspaceId) {
    const { data: workspace } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .limit(1)
      .single();

    if (!workspace) return { notes: [], totalCount: 0 };
    currentWorkspaceId = workspace.workspace_id;
  }

  const selectQuery = `
    *,
    assets(*),
    tag_list:note_tags(
      tag:tags(*)
    )
  `;

  let queryBuilder = supabase
    .from("notes")
    .select(selectQuery, { count: "exact" })
    .eq("workspace_id", currentWorkspaceId)
    .not("deleted_at", "is", null);

  if (signal) {
    queryBuilder = queryBuilder.abortSignal(signal);
  }

  if (page !== undefined && pageSize !== undefined) {
    const from = page * pageSize;
    const to = from + pageSize - 1;
    queryBuilder = queryBuilder.range(from, to);
  }

  const { data, error, count } = await queryBuilder.order("deleted_at", {
    ascending: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  // tag_list 정규화
  const transformedData = transformNoteTagList(data);

  const parsed = noteWithAssetSchema.array().safeParse(transformedData);

  if (!parsed.success) {
    return { notes: [], totalCount: 0 };
  }

  return {
    notes: parsed.data,
    totalCount: count || 0,
  };
}

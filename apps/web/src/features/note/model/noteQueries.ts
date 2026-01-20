import type { Database } from "@pickle/contracts";
import type { SupabaseClient } from "@supabase/supabase-js";
import { queryOptions } from "@tanstack/react-query";
import { type GetNotesParams, getNotes } from "../api/getNotes";
import { getTrashNotes } from "../api/getTrashNotes";
import { type SearchNotesParams, searchNotes } from "../api/searchNotes";

export const noteKeys = {
  all: ["notes"] as const,
  lists: () => [...noteKeys.all, "list"] as const,
  list: (params: GetNotesParams = {}) =>
    [...noteKeys.lists(), params.workspaceId, params.filter] as const,
};

export const noteQueries = {
  list: (params: GetNotesParams = {}) =>
    queryOptions({
      queryKey: noteKeys.list(params),
      queryFn: () => getNotes(params),
      staleTime: 0,
    }),
  search: (params: SearchNotesParams = {}) =>
    queryOptions({
      queryKey: [
        "notes",
        "search",
        params.workspaceId,
        params.query,
        params.filter,
        params.sort,
      ],
      queryFn: ({ signal }) => searchNotes({ ...params, signal }),
      staleTime: 0,
    }),
  trash: (client?: SupabaseClient<Database>, workspaceId?: string) =>
    queryOptions({
      queryKey: ["notes", "trash", workspaceId],
      queryFn: () => getTrashNotes(client, workspaceId),
      staleTime: 0,
    }),
};

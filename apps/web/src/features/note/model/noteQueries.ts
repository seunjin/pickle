import type { Database } from "@pickle/contracts";
import type { SupabaseClient } from "@supabase/supabase-js";
import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
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
  searchInfinite: (params: SearchNotesParams = {}, pageSize = 20) =>
    infiniteQueryOptions({
      queryKey: [
        "notes",
        "search",
        "infinite",
        params.workspaceId,
        params.query,
        params.filter,
        params.sort,
      ],
      queryFn: ({ pageParam = 0, signal }) =>
        searchNotes({ ...params, page: pageParam as number, pageSize, signal }),
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.notes.length === pageSize ? allPages.length : undefined;
      },
      initialPageParam: 0,
    }),
  listInfinite: (params: GetNotesParams = {}, pageSize = 20) =>
    infiniteQueryOptions({
      queryKey: [
        "notes",
        "list",
        "infinite",
        params.workspaceId,
        params.filter,
        params.sort,
      ],
      queryFn: ({ pageParam = 0, signal }) =>
        getNotes({ ...params, page: pageParam as number, pageSize, signal }),
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.notes.length === pageSize ? allPages.length : undefined;
      },
      initialPageParam: 0,
    }),
  trashInfinite: (params: GetNotesParams = {}, pageSize = 20) =>
    infiniteQueryOptions({
      queryKey: ["notes", "trash", "infinite", params.workspaceId, params.sort],
      queryFn: ({ pageParam = 0, signal }) =>
        getTrashNotes({
          ...params,
          page: pageParam as number,
          pageSize,
          signal,
        }),
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.notes.length === pageSize ? allPages.length : undefined;
      },
      initialPageParam: 0,
    }),
  trash: (params: GetNotesParams = {}) =>
    queryOptions({
      queryKey: ["notes", "trash", params.workspaceId],
      queryFn: () => getTrashNotes(params),
      staleTime: 0,
    }),
};

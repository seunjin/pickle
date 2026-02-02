import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { type GetNotesParams, getNotes } from "../api/getNotes";
import { getTrashNotes } from "../api/getTrashNotes";

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
  trash: (params: GetNotesParams = {}) =>
    queryOptions({
      queryKey: ["notes", "trash", params.workspaceId],
      queryFn: () => getTrashNotes(params),
      staleTime: 0,
    }),
};

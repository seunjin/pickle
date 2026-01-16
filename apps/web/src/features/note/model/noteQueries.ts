import { queryOptions } from "@tanstack/react-query";
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
  trash: (client?: any, workspaceId?: string) =>
    queryOptions({
      queryKey: ["notes", "trash", workspaceId],
      queryFn: () => getTrashNotes(client, workspaceId),
      staleTime: 0,
    }),
};

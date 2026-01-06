import type { NoteWithAsset } from "@pickle/contracts/src/note";
import { queryOptions } from "@tanstack/react-query";
import { type GetNotesParams, getNotes } from "../api/getNotes";

export const noteKeys = {
  all: ["notes"] as const,
  lists: () => [...noteKeys.all, "list"] as const,
  list: (params: GetNotesParams = {}) =>
    [...noteKeys.lists(), params.filter] as const,
};

export const noteQueries = {
  list: (params: GetNotesParams = {}) =>
    queryOptions({
      queryKey: noteKeys.list(params),
      queryFn: () => getNotes(params),
    }),
};

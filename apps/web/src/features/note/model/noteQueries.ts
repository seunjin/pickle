import type { SupabaseClient } from "@supabase/supabase-js";
import { queryOptions } from "@tanstack/react-query";
import { type GetNotesParams, getNotes } from "../api/getNotes";
import { getTrashNotes } from "../api/getTrashNotes";

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
      staleTime: 0,
    }),
  trash: (client?: any) =>
    queryOptions({
      queryKey: ["notes", "trash"],
      queryFn: () => getTrashNotes(client),
      staleTime: 0,
    }),
};

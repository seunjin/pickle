import { queryOptions } from "@tanstack/react-query";
import { getNotes } from "../api/getNotes";

export const noteKeys = {
  all: ["notes"] as const,
  lists: () => [...noteKeys.all, "list"] as const,
};

export const noteQueries = {
  all: () =>
    queryOptions({
      queryKey: noteKeys.all,
      queryFn: () => getNotes(),
    }),
};

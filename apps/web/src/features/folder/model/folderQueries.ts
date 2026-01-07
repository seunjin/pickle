import type { Database } from "@pickle/contracts";
import type { SupabaseClient } from "@supabase/supabase-js";
import { queryOptions } from "@tanstack/react-query";
import { getFolders } from "../api/getFolders";

export const folderKeys = {
  all: ["folders"] as const,
  lists: () => [...folderKeys.all, "list"] as const,
  list: () => [...folderKeys.lists()] as const,
};

export const folderQueries = {
  list: (client: SupabaseClient<Database>) =>
    queryOptions({
      queryKey: folderKeys.list(),
      queryFn: () => getFolders({ client }),
    }),
};

import type { Database } from "@pickle/contracts";
import type { SupabaseClient } from "@supabase/supabase-js";
import { queryOptions } from "@tanstack/react-query";
import { getTags } from "../api/getTags";

export const tagKeys = {
  all: ["tags"] as const,
  lists: () => [...tagKeys.all, "list"] as const,
  list: (workspaceId: string) => [...tagKeys.lists(), workspaceId] as const,
};

export const tagQueries = {
  all: tagKeys.all,
  list: (
    params: { client?: SupabaseClient<Database>; workspaceId?: string } = {},
  ) =>
    queryOptions({
      queryKey: params.workspaceId
        ? tagKeys.list(params.workspaceId)
        : tagKeys.lists(),
      queryFn: () => getTags(params),
    }),
};

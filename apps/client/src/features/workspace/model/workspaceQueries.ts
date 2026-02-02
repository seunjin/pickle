import { queryOptions } from "@tanstack/react-query";
import { getWorkspaceUsage } from "../api/getWorkspaceUsage";

export const workspaceKeys = {
  all: ["workspace"] as const,
  usage: (workspaceId: string) =>
    [...workspaceKeys.all, "usage", workspaceId] as const,
};

export const workspaceQueries = {
  usage: (workspaceId: string) =>
    queryOptions({
      queryKey: workspaceKeys.usage(workspaceId),
      queryFn: () => getWorkspaceUsage(workspaceId),
      enabled: !!workspaceId,
      staleTime: 1000 * 60, // 1분
    }),
};

import type { CreateTagInput, UpdateTagInput } from "@pickle/contracts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTag } from "../api/createTag";
import { deleteTag } from "../api/deleteTag";
import { updateTag } from "../api/updateTag";
import { tagQueries } from "./tagQueries";

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTagInput) => createTag(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagQueries.all });
    },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tagId, input }: { tagId: string; input: UpdateTagInput }) =>
      updateTag(tagId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagQueries.all });
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tagId: string) => deleteTag(tagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagQueries.all });
    },
  });
}

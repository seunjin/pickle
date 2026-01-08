import { toast } from "@pickle/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteNote } from "../api/deleteNote";
import { noteKeys } from "./noteQueries";

/**
 * 노트 삭제를 위한 Mutation 훅
 */
export function useDeleteNoteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noteId: string) => deleteNote(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.all });
      toast.success({ title: "노트가 휴지통으로 이동되었습니다." });
    },
    onError: (error) => {
      toast.error({
        title: "삭제에 실패했습니다.",
        description: error.message,
      });
    },
  });
}

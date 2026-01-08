import { useToast } from "@pickle/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { restoreNote } from "../api/restoreNote";

export function useRestoreNoteMutation() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (noteId: string) => restoreNote(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success({
        title: "노트가 복원되어 Inbox로 이동되었습니다.",
      });
    },
    onError: (error) => {
      console.error("Failed to restore note:", error);
      toast.error({
        title: "복원에 실패했습니다.",
        description: error.message,
      });
    },
  });
}

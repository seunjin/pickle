import { useToast } from "@pickle/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { permanentlyDeleteNote } from "../api/permanentlyDeleteNote";

export function usePermanentlyDeleteNoteMutation() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (noteId: string) => permanentlyDeleteNote(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success({
        title: "노트가 영구 삭제되었습니다.",
      });
    },
    onError: (error) => {
      console.error("Failed to permanently delete note:", error);
      toast.error({
        title: "영구 삭제에 실패했습니다.",
        description: error.message,
      });
    },
  });
}

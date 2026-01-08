import { useDialog, useToast } from "@pickle/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { permanentlyDeleteAllTrashNotes } from "../api/permanentlyDeleteAllTrashNotes";

export function useEmptyTrashMutation() {
  const dialog = useDialog();
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: () => permanentlyDeleteAllTrashNotes(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      dialog.close();
      toast.success({
        title: "휴지통의 비우기에 성공했습니다.",
      });
    },
    onError: (error) => {
      console.error("Failed to empty trash:", error);
      dialog.close();
      toast.error({
        title: "휴지통 비우기에 실패했습니다.",
        description: error.message,
      });
    },
  });
}

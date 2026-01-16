import type { UpdateNoteInput } from "@pickle/contracts/src/note";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateNote } from "../api/updateNote";
import { noteKeys } from "./noteQueries";

/**
 * 노트 업데이트를 위한 Mutation 훅
 */
export function useUpdateNoteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      noteId,
      payload,
    }: {
      noteId: string;
      payload: UpdateNoteInput;
    }) => updateNote(noteId, payload),
    onSuccess: () => {
      // 관련 쿼리 무효화 (목록 및 상세)
      queryClient.invalidateQueries({ queryKey: noteKeys.all });
    },
  });
}

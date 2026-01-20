import type {
  NoteWithAsset,
  UpdateNoteInput,
} from "@pickle/contracts/src/note";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCacheItem } from "@/shared/lib/react-query/optimistic";
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

    // ✅ 낙관적 업데이트 구현
    onMutate: async ({ noteId, payload }) => {
      // 1. 관련 쿼리 취소
      await queryClient.cancelQueries({ queryKey: noteKeys.all });

      // 2. 이전 데이터 스냅샷 저장
      const previousData = queryClient.getQueriesData({
        queryKey: noteKeys.all,
      });

      // 3. 캐시 업데이트 (유틸리티 사용으로 타입 안정성 확보)
      queryClient.setQueriesData({ queryKey: noteKeys.all }, (old) =>
        updateCacheItem<NoteWithAsset>(old, noteId, payload),
      );

      return { previousData };
    },

    // 에러 발생 시 롤백
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        for (const [queryKey, data] of context.previousData) {
          queryClient.setQueryData(queryKey, data);
        }
      }
    },

    // 성공 또는 에러 시 서버와 데이터 동기화
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.all });
    },
  });
}

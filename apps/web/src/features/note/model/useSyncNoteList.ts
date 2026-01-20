import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { noteKeys } from "./noteQueries";

/**
 * useSyncNoteList Hook
 *
 * BroadcastChannel을 통해 다른 탭이나 익스텐션에서 노트를 저장했다는 신호를 수신합니다.
 * 신호를 받으면 즉시 노트 목록 쿼리를 무효화하여 화면을 최신 상태로 유지합니다.
 */
export function useSyncNoteList() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // 'pickle_sync' 채널 생성 (모든 탭 간 공유)
    const channel = new BroadcastChannel("pickle_sync");

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "PICKLE_NOTE_SAVED") {
        // 노트 관련 모든 쿼리 무효화
        queryClient.invalidateQueries({
          queryKey: noteKeys.all,
        });
      }
    };

    channel.addEventListener("message", handleMessage);

    return () => {
      channel.removeEventListener("message", handleMessage);
      channel.close();
    };
  }, [queryClient]);
}

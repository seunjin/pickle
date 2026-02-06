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
    // 1. BroadcastChannel 구독 (다른 동일 출처 탭 대응)
    const channel = new BroadcastChannel("pickle_sync");

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "PICKLE_NOTE_SAVED") {
        queryClient.invalidateQueries({
          queryKey: noteKeys.all,
        });
      }
    };

    channel.addEventListener("message", handleMessage);

    // 2. 브라우저 창(window.postMessage) 신호 수신 (익스텐션 iframe 브릿지)
    const handleWindowMessage = (event: MessageEvent) => {
      const type = event.data?.type;
      if (type === "PICKLE_NOTE_SAVED" || type === "PICKLE_SYNC_REQUEST") {
        queryClient.invalidateQueries({
          queryKey: noteKeys.all,
        });
        // 다른 동일 출처 탭에도 알림 공유 (Proxy)
        if (type !== "PICKLE_NOTE_SAVED") {
          channel.postMessage({ type: "PICKLE_NOTE_SAVED" });
        }
      }
    };
    window.addEventListener("message", handleWindowMessage);

    // 3. 윈도우 포커스 시점에 리프레시 (탭 전환 및 지연 동기화 대응)
    const handleFocus = () => {
      queryClient.invalidateQueries({
        queryKey: noteKeys.all,
        refetchType: "active",
      });
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      channel.removeEventListener("message", handleMessage);
      channel.close();
      window.removeEventListener("message", handleWindowMessage);
      window.removeEventListener("focus", handleFocus);
    };
  }, [queryClient]);
}

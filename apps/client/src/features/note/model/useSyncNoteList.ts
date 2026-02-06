import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { noteKeys } from "./noteQueries";

/**
 * 프로젝트 전반의 데이터 변경 신호를 감지하여 노트 리스트를 최신화하는 훅입니다.
 * - BroadcastChannel("pickle_sync")을 통해 다른 탭/익스텐션의 변경 사항을 수신합니다.
 * - 윈도우 포커스 시점에도 데이터를 리프레시합니다.
 */
export function useSyncNoteList() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // 1. BroadcastChannel 구독
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

    // 3. 윈도우 포커스 시점에 리프레시 (탭 전환 대응)
    const handleFocus = () => {
      // 탭 전환 시점에 데이터 최신화 확인
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

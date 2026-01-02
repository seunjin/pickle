import { sendMessageToContentScript } from "@background/messaging";
import { setNote } from "@shared/storage";

export async function startCaptureFlow(tab: chrome.tabs.Tab) {
  if (!tab.windowId || !tab.id) return;

  // 1. 초기 상태 저장
  await setNote(tab.id, {
    text: "",
    url: tab.url,
    timestamp: Date.now(),
    mode: "capture",
  });

  // 2. Content Script에 캡쳐 시작 요청
  sendMessageToContentScript(tab.id, { action: "START_CAPTURE" }).catch(
    (error) => {
      console.warn("캡쳐 스크립트 연결 실패:", error);
    },
  );
}

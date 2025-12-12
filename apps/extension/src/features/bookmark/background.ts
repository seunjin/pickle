import { sendMessageToContentScript } from "@background/messaging";
import { setNote } from "@shared/storage";
import type { BookmarkData } from "@shared/types";

export async function startBookmarkFlow(tab: chrome.tabs.Tab) {
  if (!tab.windowId || !tab.id) return;

  // 1. 초기 상태 저장 (로딩 시작)
  await setNote(tab.id, {
    text: "",
    url: tab.url,
    timestamp: Date.now(),
    mode: "bookmark",
    isLoading: true,
  });

  // 2. Open Overlay
  await sendMessageToContentScript(tab.id, {
    action: "OPEN_OVERLAY",
    mode: "bookmark",
    tabId: tab.id,
  });

  try {
    // Content Script에 메타데이터 요청
    const metadata = (await sendMessageToContentScript(tab.id, {
      action: "GET_METADATA",
    })) as BookmarkData;

    // 결과 저장 및 로딩 해제
    await setNote(tab.id, {
      text: "",
      url: tab.url,
      timestamp: Date.now(),
      mode: "bookmark",
      isLoading: false,
      bookmarkData: metadata,
    });
  } catch (error) {
    console.warn("메타데이터 추출 실패 (Retry Failed):", error);

    // 실패 시 기본 데이터로 저장 (Fallback)
    await setNote(tab.id, {
      text: "",
      url: tab.url,
      timestamp: Date.now(),
      mode: "bookmark",
      isLoading: false,
      bookmarkData: {
        title: tab.title || "No Title",
        url: tab.url || "",
        description:
          "메타데이터를 가져올 수 없습니다. (페이지를 새로고침 해보세요)",
        image: "",
        site_name: "",
        favicon: "",
      },
    });
  }
}

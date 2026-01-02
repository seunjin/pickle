import { sendMessageToContentScript } from "@background/messaging";
import { setNote } from "@shared/storage";
import type { PageMetadata } from "@shared/types";

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
    })) as PageMetadata;

    // 결과 저장 및 로딩 해제
    await setNote(tab.id, {
      text: "",
      url: tab.url,
      timestamp: Date.now(),
      mode: "bookmark",
      isLoading: false,
      pageMeta: metadata,
      title: metadata.title, // [추가] 추출된 제목을 에디터의 초기 제목으로 설정
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
      pageMeta: {
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

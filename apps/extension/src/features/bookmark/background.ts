import { sendMessageToContentScript } from "@background/messaging";
import { logger } from "@shared/lib/logger";
import { setNote } from "@shared/storage";
import type { PageMetadata } from "@shared/types";

export async function startBookmarkFlow(
  tab: chrome.tabs.Tab,
  initialMetadata?: PageMetadata,
) {
  if (!tab.windowId || !tab.id) return;

  // 1. 초기 상태 저장 (로딩 시작)
  await setNote(tab.id, {
    text: "",
    url: tab.url,
    timestamp: Date.now(),
    mode: "bookmark",
    isLoading: true,
  });

  // 2. Open Overlay (Top Frame 타겟팅)
  await sendMessageToContentScript(
    tab.id,
    {
      action: "OPEN_OVERLAY",
      mode: "bookmark",
      tabId: tab.id,
    },
    { frameId: 0 },
  );

  try {
    let metadata = initialMetadata;

    // 초기 메타데이터가 없으면 Content Script에 요청
    if (!metadata) {
      metadata = (await sendMessageToContentScript(tab.id, {
        action: "GET_METADATA",
      })) as PageMetadata;
    }

    if (!metadata) throw new Error("Metadata not found");

    // 결과 저장 및 로딩 해제
    await setNote(tab.id, {
      text: "",
      url: tab.url,
      timestamp: Date.now(),
      mode: "bookmark",
      isLoading: false,
      pageMeta: metadata,
      title: metadata.title,
    });
  } catch (error) {
    logger.warn("메타데이터 추출 실패 (Retry Failed)", { error });
    // ... Fallback logic remains ...

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

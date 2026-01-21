import { startBookmarkFlow } from "@features/bookmark/background";
import { startCaptureFlow } from "@features/capture/background";
import { saveNoteToSupabase } from "@features/note/api/saveNote";
import { logger } from "@shared/lib/logger";
import { clearNote, setNote, updateNote } from "@shared/storage";
import type { CaptureData, PageMetadata, ViewType } from "@shared/types";
import {
  getCurrentUser,
  getSession,
  isLoggedIn,
  launchOAuthFlow,
  logout,
} from "./auth";
import { setupContextMenus } from "./contextMenus";
import { sendMessageToContentScript } from "./messaging";

logger.info("Pickle Background Service Worker Running");

/**
 * 1. Setup Context Menus
 * 익스텐션이 설치되거나 업데이트될 때 우클릭 메뉴를 초기화합니다.
 */
chrome.runtime.onInstalled.addListener(() => {
  setupContextMenus();
});

/**
 * 2. Context Menu Handler (우클릭 메뉴 클릭 시 동작)
 * 사용자가 우클릭 메뉴 중 하나를 클릭했을 때 실행됩니다.
 */
chrome.contextMenus.onClicked.addListener(
  async (info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) => {
    // 2-1. 앱 열기: 대시보드 웹사이트를 새 탭으로 엽니다.
    if (info.menuItemId === "open-app") {
      const appUrl =
        import.meta.env.NEXT_PUBLIC_APP_URL || "https://picklenote.vercel.app";
      chrome.tabs.create({ url: appUrl });
      return;
    }

    // 2-2. 캡쳐 모드 실행: 화면 캡쳐 기능을 시작합니다.
    if (info.menuItemId === "capture" && tab) {
      await startCaptureFlow(tab);
      return;
    }

    // 2-3. 북마크 실행: 현재 페이지 정보를 저장합니다.
    if (info.menuItemId === "bookmark" && tab) {
      await startBookmarkFlow(tab);
      return;
    }

    // 2-4. 텍스트/이미지 저장 준비
    // 선택한 메뉴에 따라 'text' 모드인지 'image' 모드인지 결정합니다.
    let mode: ViewType = "menu";
    if (info.menuItemId === "save-text") mode = "text";
    else if (info.menuItemId === "save-image") mode = "image";

    if (tab?.windowId && tab.id) {
      // 1) 선택된 데이터(텍스트, URL 등)를 Chrome Storage에 임시 저장합니다.
      //    (Content Script와 데이터를 공유하기 위함)
      await setNote(tab.id, {
        text: info.selectionText,
        url: info.pageUrl,
        srcUrl: info.srcUrl,
        timestamp: Date.now(),
        mode: mode,
      });

      // 2) Content Script에 "오버레이를 열어라(OPEN_OVERLAY)" 메시지를 보냅니다.
      await sendMessageToContentScript(tab.id, {
        action: "OPEN_OVERLAY",
        mode: mode,
        tabId: tab.id,
      });

      // 3) [ADD] Text/Image 모드에서도 메타데이터(파비콘 등)를 가져와 저장합니다.
      // 저장이 비동기로 이루어져도 오버레이 UI는 이미 열려있으므로 사용자 경험에 지연이 없습니다.
      sendMessageToContentScript(tab.id, { action: "GET_METADATA" })
        .then((metadata: PageMetadata) => {
          if (metadata && tab.id) {
            logger.debug("Metadata fetched in background", { metadata });
            updateNote(tab.id, {
              pageMeta: metadata,
              // title은 에디터에서 관리하도록 제거
            });
          }
        })
        .catch((err) =>
          logger.warn("Background metadata fetch failed", { error: err }),
        );
    }
  },
);

/**
 * 4. Message Handler (내부 메시지 수신)
 * Content Script나 Popup, Sidepanel 등에서 보낸 메시지를 처리합니다.
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // 4-1. 캡쳐 영역 지정 완료 (CAPTURE_AREA)
  // 사용자가 드래그하여 캡쳐할 영역을 선택했을 때 호출됩니다.
  if (request.action === "CAPTURE_AREA") {
    const windowId = sender.tab?.windowId;
    const tabId = sender.tab?.id;

    if (windowId && tabId) {
      // 1. [최적화] 즉시 로딩 상태로 변경하고 오버레이부터 열기 요청!
      // 이렇게 하면 사용자가 마우스를 떼는 즉시 스피너가 포함된 오버레이가 나타납니다.
      updateNote(tabId, { isLoading: true, mode: "capture" }).then(() => {
        sendMessageToContentScript(tabId, {
          action: "OPEN_OVERLAY",
          mode: "capture",
          tabId: tabId,
        });
      });

      // 2. 그 사이에 백그라운드에서 스크린샷 작업을 수행
      chrome.tabs.captureVisibleTab(
        windowId,
        { format: "png" },
        async (dataUrl) => {
          const captureData: CaptureData = {
            image: dataUrl, // Base64 이미지 데이터
            area: request.area, // 선택 영역 좌표
          };

          // 캡쳐된 데이터를 스토리지에 저장하고 로딩 상태 해제
          await updateNote(tabId, {
            isLoading: false,
            captureData: captureData,
          });

          // 3. 메타데이터(Title, Favicon 등) 가져오기
          sendMessageToContentScript(tabId, { action: "GET_METADATA" })
            .then((metadata) => {
              if (metadata) {
                logger.debug("Metadata fetched after capture", { metadata });
                updateNote(tabId, {
                  pageMeta: metadata as PageMetadata,
                  // title은 에디터에서 관리하도록 제거
                });
              }
            })
            .catch((err) =>
              logger.warn("Capture metadata fetch failed", { error: err }),
            );
        },
      );
    }
  }
  // 4-2. 노트 저장 요청 (SAVE_NOTE)
  // Overlay UI에서 사용자가 '저장' 버튼을 눌렀을 때 호출됩니다.
  else if (request.action === "SAVE_NOTE") {
    // 실제 DB 저장 로직은 Service 모듈(saveNote.ts)로 위임합니다.
    saveNoteToSupabase(request.note).then((result) => sendResponse(result));
    return true; // 비동기 응답(sendResponse)을 위해 true 반환 필수
  }
  // 4-3. 스토리지 직접 저장 요청 (SAVE_TO_STORAGE)
  // 팝업 등에서 특정 탭의 데이터를 즉시 동기화할 때 사용합니다.
  else if (request.action === "SAVE_TO_STORAGE") {
    setNote(request.tabId, request.data).then(() =>
      sendResponse({ success: true }),
    );
    return true;
  }
  // 4-4. 재캡쳐 요청 (RE_CAPTURE)
  else if (request.action === "RE_CAPTURE") {
    if (sender.tab) {
      startCaptureFlow(sender.tab);
    }
  }
  // 4-4. 로그인 요청 (LOGIN)
  else if (request.action === "LOGIN") {
    launchOAuthFlow()
      .then((session) => {
        sendResponse({ success: !!session, session });
      })
      .catch((error) => {
        logger.error("Login failed", { error });
        sendResponse({ success: false, error: error.message });
      });
    return true; // 비동기 응답 대기
  }
  // 4-5. 로그아웃 요청 (LOGOUT)
  else if (request.action === "LOGOUT") {
    logout()
      .then(() => sendResponse({ success: true }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }
  // 4-6. 세션 조회 (GET_SESSION)
  else if (request.action === "GET_SESSION") {
    getSession()
      .then((session) => sendResponse({ success: true, session }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }
  // 4-7. 사용자 정보 조회 (GET_USER)
  else if (request.action === "GET_USER") {
    getCurrentUser()
      .then((user) => sendResponse({ success: true, user }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }
  // 4-8. 로그인 상태 확인 (IS_LOGGED_IN)
  else if (request.action === "IS_LOGGED_IN") {
    isLoggedIn()
      .then((loggedIn) => sendResponse({ success: true, loggedIn }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }
  // 4-9. 새 탭 열기 (OPEN_TAB)
  else if (request.action === "OPEN_TAB") {
    chrome.tabs.create({ url: request.url });
    return false; // 동기 응답
  }
  // 4-10. 오버레이 열기 중계 (OPEN_OVERLAY)
  // 팝업에서 호출 시 Content Script가 로드되었는지 확인하고 안전하게 보냅니다.
  else if (request.action === "OPEN_OVERLAY") {
    const tabId = request.tabId;
    if (tabId) {
      sendMessageToContentScript(tabId, {
        action: "OPEN_OVERLAY",
        mode: request.mode,
        tabId: tabId,
      }).then((response) => sendResponse(response));
      return true;
    }
  }
  // 4-11. 텍스트 선택 정보 중계 (GET_SELECTION)
  else if (request.action === "GET_SELECTION") {
    const tabId = request.tabId;
    if (tabId) {
      sendMessageToContentScript(tabId, { action: "GET_SELECTION" }).then(
        (response) => sendResponse(response),
      );
      return true;
    }
  }
  // 4-12. 북마크 플로우 실행 (팝업 및 단축키용)
  else if (request.action === "RUN_BOOKMARK_FLOW") {
    const tabId = request.tabId || sender.tab?.id;
    if (tabId) {
      chrome.tabs.get(tabId, (tab) => {
        if (chrome.runtime.lastError || !tab) {
          sendResponse({ success: false, error: "Tab not found" });
          return;
        }
        startBookmarkFlow(tab).then(() => sendResponse({ success: true }));
      });
      return true;
    }
    sendResponse({ success: false, error: "No tabId provided" });
    return true;
  }
  // 4-13. 캡처 플로우 실행 (팝업 및 단축키용)
  else if (request.action === "RUN_CAPTURE_FLOW") {
    const tabId = request.tabId || sender.tab?.id;
    if (tabId) {
      chrome.tabs.get(tabId, (tab) => {
        if (chrome.runtime.lastError || !tab) {
          sendResponse({ success: false, error: "Tab not found" });
          return;
        }
        startCaptureFlow(tab).then(() => sendResponse({ success: true }));
      });
      return true;
    }
    sendResponse({ success: false, error: "No tabId provided" });
    return true;
  }
  // 4-14. 텍스트 저장 플로우 (단축키용)
  else if (request.action === "RUN_TEXT_FLOW") {
    const tabId = sender.tab?.id;
    if (tabId) {
      // 텍스트 선택 정보 가져오기 시도
      sendMessageToContentScript(tabId, { action: "GET_SELECTION" }).then(
        (response) => {
          const text = response?.text || "";
          if (text) {
            setNote(tabId, {
              text,
              url: sender.tab?.url,
              timestamp: Date.now(),
              mode: "text",
            }).then(() => {
              sendMessageToContentScript(tabId, {
                action: "OPEN_OVERLAY",
                mode: "text",
                tabId: tabId,
              });
            });
          } else {
            logger.debug("No text selected for shortcut");
          }
        },
      );
    }
  }
  // 4-15. 이미지 저장 플로우 (단축키용)
  else if (request.action === "RUN_IMAGE_FLOW") {
    const tabId = sender.tab?.id;
    const imageData = request.imageData;

    if (tabId && imageData) {
      setNote(tabId, {
        srcUrl: imageData.src,
        altText: imageData.alt,
        url: sender.tab?.url,
        timestamp: Date.now(),
        mode: "image",
      }).then(() => {
        sendMessageToContentScript(tabId, {
          action: "OPEN_OVERLAY",
          mode: "image",
          tabId: tabId,
        });
      });
    } else {
      logger.debug("No hovered image data for shortcut");
    }
  }
});

/**
 * 5. External Message Handler (Auth Sync)
 * 외부 웹페이지(picklenote.vercel.app)에서 보낸 메시지를 수신합니다.
 * 주로 '로그인 세션 동기화'를 위해 사용됩니다.
 */
chrome.runtime.onMessageExternal.addListener(
  (message, _sender, sendResponse) => {
    // 웹에서 로그인 성공 후 세션 정보를 보내주는 경우
    if (message.type === "SYNC_SESSION" && message.session) {
      logger.debug("Session received from Web");

      // 받은 세션을 익스텐션의 로컬 스토리지에 저장합니다.
      chrome.storage.local.set({ supabaseSession: message.session }, () => {
        logger.debug("Session saved to local storage");
        sendResponse({ success: true });
      });
      return true; // 비동기 응답 대기
    }
  },
);

/**
 * 6. Cleanup Handler
 * 탭이 닫힐 때, 해당 탭과 관련된 임시 데이터(Storage)를 정리합니다.
 */
chrome.tabs.onRemoved.addListener((tabId) => {
  clearNote(tabId);
});

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
 */
chrome.runtime.onInstalled.addListener(() => {
  setupContextMenus();
});

/**
 * 2. Context Menu Handler
 */
chrome.contextMenus.onClicked.addListener(
  async (info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) => {
    if (info.menuItemId === "open-app") {
      const appUrl =
        import.meta.env.NEXT_PUBLIC_APP_URL || "https://picklenote.vercel.app";
      chrome.tabs.create({ url: appUrl });
      return;
    }

    if (info.menuItemId === "capture" && tab) {
      await startCaptureFlow(tab);
      return;
    }

    if (info.menuItemId === "bookmark" && tab) {
      await startBookmarkFlow(tab);
      return;
    }

    let mode: ViewType = "menu";
    if (info.menuItemId === "save-text") mode = "text";
    else if (info.menuItemId === "save-image") mode = "image";

    if (tab?.windowId && tab.id) {
      await setNote(tab.id, {
        text: info.selectionText,
        url: info.pageUrl,
        srcUrl: info.srcUrl,
        timestamp: Date.now(),
        mode: mode,
      });

      await sendMessageToContentScript(tab.id, {
        action: "OPEN_OVERLAY",
        mode: mode,
        tabId: tab.id,
      });

      sendMessageToContentScript(tab.id, { action: "GET_METADATA" })
        .then((metadata: PageMetadata) => {
          if (metadata && tab.id) {
            logger.debug("Metadata fetched in background", { metadata });
            updateNote(tab.id, { pageMeta: metadata });
          }
        })
        .catch((err) =>
          logger.warn("Background metadata fetch failed", { error: err }),
        );
    }
  },
);

/**
 * 4. Message Handler
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "CAPTURE_AREA") {
    const windowId = sender.tab?.windowId;
    const tabId = sender.tab?.id;

    if (windowId && tabId) {
      updateNote(tabId, { isLoading: true, mode: "capture" }).then(() => {
        sendMessageToContentScript(tabId, {
          action: "OPEN_OVERLAY",
          mode: "capture",
          tabId: tabId,
        });
      });

      chrome.tabs.captureVisibleTab(
        windowId,
        { format: "png" },
        async (dataUrl) => {
          const captureData: CaptureData = {
            image: dataUrl,
            area: request.area,
          };

          await updateNote(tabId, {
            isLoading: false,
            captureData: captureData,
          });

          sendMessageToContentScript(tabId, { action: "GET_METADATA" })
            .then((metadata) => {
              if (metadata) {
                updateNote(tabId, {
                  pageMeta: metadata as PageMetadata,
                });
              }
            })
            .catch((err) =>
              logger.warn("Capture metadata fetch failed", { error: err }),
            );
        },
      );
    }
  } else if (request.action === "SAVE_NOTE") {
    // 🚀 Fire and Forget Support
    // 알림 기능을 제거하고 백그라운드에서 조용히 저장만 수행합니다.
    saveNoteToSupabase(request.note)
      .then((result) => {
        logger.info("Background save result", { success: result.success });
        sendResponse(result);
      })
      .catch((err) => {
        logger.error("Internal save error in background", { error: err });
        sendResponse({ success: false, error: err.message });
      });
    return true; // 비동기 응답 대기
  } else if (request.action === "SAVE_TO_STORAGE") {
    setNote(request.tabId, request.data).then(() =>
      sendResponse({ success: true }),
    );
    return true;
  } else if (request.action === "RE_CAPTURE") {
    if (sender.tab) {
      startCaptureFlow(sender.tab);
    }
  } else if (request.action === "LOGIN") {
    launchOAuthFlow()
      .then((session) => {
        sendResponse({ success: !!session, session });
      })
      .catch((error) => {
        logger.error("Login failed", { error });
        sendResponse({ success: false, error: error.message });
      });
    return true;
  } else if (request.action === "LOGOUT") {
    logout()
      .then(() => sendResponse({ success: true }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  } else if (request.action === "GET_SESSION") {
    getSession()
      .then((session) => sendResponse({ success: true, session }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  } else if (request.action === "GET_USER") {
    getCurrentUser()
      .then((user) => sendResponse({ success: true, user }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  } else if (request.action === "IS_LOGGED_IN") {
    isLoggedIn()
      .then((loggedIn) => sendResponse({ success: true, loggedIn }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  } else if (request.action === "OPEN_TAB") {
    chrome.tabs.create({ url: request.url });
    return false;
  } else if (request.action === "OPEN_OVERLAY") {
    const tabId = request.tabId;
    if (tabId) {
      sendMessageToContentScript(tabId, {
        action: "OPEN_OVERLAY",
        mode: request.mode,
        tabId: tabId,
      }).then((response) => sendResponse(response));
      return true;
    }
  } else if (request.action === "GET_SELECTION") {
    const tabId = request.tabId;
    if (tabId) {
      sendMessageToContentScript(tabId, { action: "GET_SELECTION" }).then(
        (response) => sendResponse(response),
      );
      return true;
    }
  } else if (request.action === "RUN_BOOKMARK_FLOW") {
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
  } else if (request.action === "RUN_CAPTURE_FLOW") {
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
  } else if (request.action === "RUN_TEXT_FLOW") {
    const tabId = sender.tab?.id;
    if (tabId) {
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
          }
        },
      );
    }
  } else if (request.action === "RUN_IMAGE_FLOW") {
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
    }
  }
});

/**
 * 5. External Message Handler
 */
chrome.runtime.onMessageExternal.addListener(
  (message, _sender, sendResponse) => {
    if (message.type === "SYNC_SESSION" && message.session) {
      chrome.storage.local.set({ supabaseSession: message.session }, () => {
        sendResponse({ success: true });
      });
      return true;
    }
  },
);

/**
 * 6. Cleanup Handler
 */
chrome.tabs.onRemoved.addListener((tabId) => {
  clearNote(tabId);
});

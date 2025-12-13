import { startBookmarkFlow } from "@features/bookmark/background";
import { startCaptureFlow } from "@features/capture/background";
import { clearNote, setNote, updateNote } from "@shared/storage";
import type { CaptureData, ViewType } from "@shared/types";
import { setupContextMenus } from "./contextMenus";
import { sendMessageToContentScript } from "./messaging";

console.log("Pickle Note Background Service Worker Running");

// 1. Setup Context Menus
chrome.runtime.onInstalled.addListener(() => {
  setupContextMenus();
});

// 2. Context Menu Handler
chrome.contextMenus.onClicked.addListener(
  async (info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) => {
    if (info.menuItemId === "open-app") {
      chrome.tabs.create({ url: "https://picklenote.vercel.app" });
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

    // Prepare ViewType
    let mode: ViewType = "menu";
    if (info.menuItemId === "save-text") mode = "text";
    else if (info.menuItemId === "save-image") mode = "image";

    if (tab?.windowId && tab.id) {
      // Common logic for Text/Image
      await setNote(tab.id, {
        text: info.selectionText,
        url: info.pageUrl,
        srcUrl: info.srcUrl,
        timestamp: Date.now(),
        mode: mode,
      });

      // Open Overlay
      await sendMessageToContentScript(tab.id, {
        action: "OPEN_OVERLAY",
        mode: mode,
        tabId: tab.id,
      });
    }
  },
);

// 3. Command Handler (Shortcuts)
chrome.commands.onCommand.addListener(async (command, tab) => {
  if (command === "run-capture") {
    let targetTab = tab;
    if (!targetTab || !targetTab.id) {
      const [activeTab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      targetTab = activeTab;
    }

    if (targetTab?.id) {
      console.log("Starting capture flow (shortcut) for tab:", targetTab.id);
      await startCaptureFlow(targetTab);
    }
  }
});

// 4. Message Handler (Capture Area & Save Note)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "CAPTURE_AREA") {
    const windowId = sender.tab?.windowId;
    const tabId = sender.tab?.id;

    if (windowId && tabId) {
      // Loading State
      updateNote(tabId, { isLoading: true }).then(() => {
        // Capture
        chrome.tabs.captureVisibleTab(
          windowId,
          { format: "png" },
          async (dataUrl) => {
            const captureData: CaptureData = {
              image: dataUrl,
              area: request.area,
            };

            // Save & Finish Loading
            await updateNote(tabId, {
              isLoading: false,
              captureData: captureData,
              mode: "capture", // Force mode to capture to ensure view update
            });
          },
        );
      });
    }
  } else if (request.action === "SAVE_NOTE") {
    handleSaveNote(request.note).then((result) => sendResponse(result));
    return true; // Keep channel open for async response
  }
});

import type { CreateNoteInput } from "@pickle/contracts/src/note";

// ... existing imports

async function handleSaveNote(note: CreateNoteInput) {
  try {
    const result = await chrome.storage.local.get("supabaseSession");
    const supabaseSession = result.supabaseSession as
      | { access_token?: string }
      | undefined;

    if (!supabaseSession?.access_token) {
      return {
        success: false,
        error: "Unauthorized: No active session found.",
      };
    }

    const API_BASE_URL = "http://localhost:3000/api/internal/notes";

    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseSession.access_token}`,
      },
      body: JSON.stringify(note),
    });

    if (!response.ok) {
      if (response.status === 401) {
        return {
          success: false,
          error: "Unauthorized: Session expired or invalid.",
        };
      }
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || "Failed to save note.",
      };
    }

    const data = await response.json();
    return { success: true, data: data.note };
  } catch (error) {
    console.error("Background Save Error:", error);
    return { success: false, error: (error as Error).message };
  }
}

// 5. External Message Handler (Auth Sync)
chrome.runtime.onMessageExternal.addListener(
  (message, _sender, sendResponse) => {
    if (message.type === "SYNC_SESSION" && message.session) {
      console.log("Session received from Web:", message.session);
      chrome.storage.local.set({ supabaseSession: message.session }, () => {
        console.log("Session saved to local storage");
        sendResponse({ success: true });
      });
      return true; // Keep channel open for async response
    }
  },
);

// 6. Cleanup Handler
chrome.tabs.onRemoved.addListener((tabId) => {
  clearNote(tabId);
});

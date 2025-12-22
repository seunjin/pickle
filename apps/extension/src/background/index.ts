import { startBookmarkFlow } from "@features/bookmark/background";
import { startCaptureFlow } from "@features/capture/background";
import { saveNoteToSupabase } from "@features/note/api/saveNote";
import { clearNote, setNote, updateNote } from "@shared/storage";
import type { CaptureData, ViewType } from "@shared/types";
import { setupContextMenus } from "./contextMenus";
import { sendMessageToContentScript } from "./messaging";

console.log("Pickle Background Service Worker Running");

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
      chrome.tabs.create({ url: "https://picklenote.vercel.app" });
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
    }
  },
);

/**
 * 3. Command Handler (키보드 단축키)
 * manifest.json에 정의된 단축키(commands)가 입력되었을 때 실행됩니다.
 */
chrome.commands.onCommand.addListener(async (command, tab) => {
  if (command === "run-capture") {
    let targetTab = tab;
    // 활성화된 탭이 없는 경우 현재 창의 활성 탭을 찾습니다.
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
      // 로딩 상태 시작
      updateNote(tabId, { isLoading: true }).then(() => {
        // 실제 화면 캡쳐 수행 (chrome.tabs.captureVisibleTab)
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
              mode: "capture", // 뷰 모드를 캡쳐로 변경
            });

            // 🚨 핵심 수정: 캡쳐 완료 후 오버레이를 열도록 명시적 요청
            await sendMessageToContentScript(tabId, {
              action: "OPEN_OVERLAY",
              mode: "capture",
              tabId: tabId,
            });
          },
        );
      });
    }
  }
  // 4-2. 노트 저장 요청 (SAVE_NOTE)
  // Overlay UI에서 사용자가 '저장' 버튼을 눌렀을 때 호출됩니다.
  else if (request.action === "SAVE_NOTE") {
    // 실제 DB 저장 로직은 Service 모듈(saveNote.ts)로 위임합니다.
    saveNoteToSupabase(request.note).then((result) => sendResponse(result));
    return true; // 비동기 응답(sendResponse)을 위해 true 반환 필수
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
      console.log("Session received from Web:", message.session);

      // 받은 세션을 익스텐션의 로컬 스토리지에 저장합니다.
      chrome.storage.local.set({ supabaseSession: message.session }, () => {
        console.log("Session saved to local storage");
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

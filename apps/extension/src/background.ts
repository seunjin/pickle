console.log("Background service worker running");

const MENU_ROOT_ID = "pickle-root";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    // 1. Root Menu
    chrome.contextMenus.create({
      id: MENU_ROOT_ID,
      title: "Pickle Note",
      contexts: ["all"], // 모든 곳에서 표시
    });

    // 2. Sub Menus
    chrome.contextMenus.create({
      parentId: MENU_ROOT_ID,
      id: "save-text",
      title: "📝 텍스트 저장하기",
      contexts: ["selection"], // 텍스트 선택 시에만
    });

    chrome.contextMenus.create({
      parentId: MENU_ROOT_ID,
      id: "save-image",
      title: "🖼️ 이미지 저장하기",
      contexts: ["image"], // 이미지 위에서만
    });

    chrome.contextMenus.create({
      parentId: MENU_ROOT_ID,
      id: "capture",
      title: "📷 캡쳐하기 ⇧⌘E",
      contexts: ["all"],
    });

    chrome.contextMenus.create({
      parentId: MENU_ROOT_ID,
      id: "bookmark",
      title: "🔖 북마크",
      contexts: ["all"],
    });

    chrome.contextMenus.create({
      type: "separator",
      id: "separator-1",
      parentId: MENU_ROOT_ID,
      contexts: ["all"],
    });

    chrome.contextMenus.create({
      parentId: MENU_ROOT_ID,
      id: "open-app",
      title: "🚀 Pickle Note 열기",
      contexts: ["all"],
    });
  });
});

// Helper: 캡쳐 흐름 시작 (Context Menu & Shortcut 공용)
async function startCaptureFlow(tab: chrome.tabs.Tab) {
  if (!tab.windowId || !tab.id) return;

  await Promise.all([
    // 1. 사이드 패널 즉시 열기
    chrome.sidePanel.open({ windowId: tab.windowId }),
    // 2. 초기 상태 저장
    chrome.storage.local.set({
      pendingNote: {
        text: "",
        url: tab.url,
        timestamp: Date.now(),
        mode: "capture",
        captureData: undefined,
      },
    }),
    // 3. Content Script에 캡쳐 시작 요청
    chrome.tabs
      .sendMessage(tab.id, { action: "START_CAPTURE" })
      .catch((error) => {
        console.warn("캡쳐 스크립트 연결 실패:", error);
      }),
  ]);
}

// Helper: Content Script 존재 여부 확인 및 주입 후 메시지 전송
async function sendMessageToContentScript(tabId: number, message: any) {
  try {
    return await chrome.tabs.sendMessage(tabId, message);
  } catch (error: any) {
    // Content Script가 로드되지 않은 경우
    if (error.message?.includes("Receiving end does not exist")) {
      console.log(
        "Found 'Receiving end does not exist' error. Attempting injection...",
      );

      try {
        const manifest = chrome.runtime.getManifest();
        const contentScripts = manifest.content_scripts?.[0]?.js;

        if (contentScripts && contentScripts.length > 0) {
          console.log(
            `Injecting content scripts: ${contentScripts.join(", ")} into tab ${tabId}`,
          );

          await chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: contentScripts,
          });

          console.log(
            "Injection successful. Waiting for script initialization...",
          );
          await new Promise((resolve) => setTimeout(resolve, 500)); // 대기 시간 500ms로 증가

          console.log("Retrying message send...");
          const response = await chrome.tabs.sendMessage(tabId, message);
          console.log("Retry response received:", response);
          return response;
        } else {
          console.error("No content scripts found in manifest to inject.");
        }
      } catch (injectionError) {
        console.error("Script injection failed:", injectionError);
        throw injectionError; // 상위 catch로 전달
      }
    }
    throw error;
  }
}

// Helper: 북마크 흐름 시작
async function startBookmarkFlow(tab: chrome.tabs.Tab) {
  if (!tab.windowId || !tab.id) return;

  await Promise.all([
    chrome.sidePanel.open({ windowId: tab.windowId }),
    chrome.storage.local.set({
      pendingNote: {
        text: "",
        url: tab.url,
        timestamp: Date.now(),
        mode: "bookmark",
        isLoading: true, // 로딩 시작
        bookmarkData: undefined,
      },
    }),
  ]);

  try {
    // Content Script에 메타데이터 요청 (Robust)
    const metadata = await sendMessageToContentScript(tab.id, {
      action: "GET_METADATA",
    });

    // 결과 저장 및 로딩 해제
    await chrome.storage.local.set({
      pendingNote: {
        text: "",
        url: tab.url,
        timestamp: Date.now(),
        mode: "bookmark",
        isLoading: false,
        bookmarkData: metadata,
      },
    });
  } catch (error) {
    console.warn("메타데이터 추출 실패 (Retry Failed):", error);

    // 실패 시 기본 데이터로 저장 (Fallback)
    await chrome.storage.local.set({
      pendingNote: {
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
          image: "", // 이미지가 없으면 기본 아이콘 표시됨
        },
      },
    });
  }
}

chrome.contextMenus.onClicked.addListener(
  async (info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) => {
    // 앱 열기는 별도 처리
    if (info.menuItemId === "open-app") {
      chrome.tabs.create({ url: "https://picklenote.vercel.app" });
      return;
    }

    // 캡쳐 기능은 별도 처리
    if (info.menuItemId === "capture") {
      if (tab) {
        await startCaptureFlow(tab);
      }
      return;
    }

    // 북마크 기능 별도 처리
    if (info.menuItemId === "bookmark") {
      if (tab) {
        await startBookmarkFlow(tab);
      }
      return;
    }

    // View 모드 매핑
    let mode = "menu";
    if (info.menuItemId === "save-text") mode = "text";
    else if (info.menuItemId === "save-image") mode = "image";
    // bookmark 처리는 위로 이동됨

    if (tab?.windowId) {
      await Promise.all([
        // 1. 데이터 및 모드 저장
        chrome.storage.local.set({
          pendingNote: {
            text: info.selectionText,
            url: info.pageUrl,
            srcUrl: info.srcUrl, // 이미지 URL
            timestamp: Date.now(),
            mode: mode, // 화면 전환을 위한 모드 값
          },
        }),
        // 2. 사이드 패널 열기
        chrome.sidePanel.open({ windowId: tab.windowId }),
      ]);
    }
  },
);

// 단축키 리스너
chrome.commands.onCommand.addListener(async (command, tab) => {
  if (command === "run-capture") {
    let targetTab = tab;

    // tab 정보가 없거나 ID가 없는 경우 현재 활성 탭 조회
    if (!targetTab || !targetTab.id) {
      const [activeTab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      targetTab = activeTab;
    }

    if (targetTab?.id) {
      console.log("Starting capture flow for tab:", targetTab.id);
      await startCaptureFlow(targetTab);
    } else {
      console.warn("No active tab found for capture.");
    }
  }
});

// Content Script로부터 캡쳐 영역 수신
chrome.runtime.onMessage.addListener((request, sender) => {
  if (request.action === "CAPTURE_AREA") {
    const windowId = sender.tab?.windowId;

    if (windowId) {
      // 1. "로딩 중" 상태로 먼저 업데이트 (UI 피드백)
      chrome.storage.local
        .set({
          pendingNote: {
            text: "",
            url: request.pageUrl,
            timestamp: Date.now(),
            mode: "capture",
            isLoading: true, // 로딩 표시
            captureData: undefined,
          },
        })
        .then(() => {
          // 2. 현재 탭 화면 캡쳐 (보이는 영역 전체)
          // 주의: Side Panel이 열리면서 Viewport 크기가 변했을 수 있음
          chrome.tabs.captureVisibleTab(
            windowId,
            { format: "png" },
            async (dataUrl) => {
              // 3. 캡쳐 데이터 저장 및 로딩 해제
              await chrome.storage.local.set({
                pendingNote: {
                  text: "",
                  url: request.pageUrl,
                  timestamp: Date.now(),
                  mode: "capture",
                  isLoading: false, // 로딩 완료
                  captureData: {
                    image: dataUrl, // 전체 스크린샷
                    area: request.area, // 크롭할 좌표 {x, y, width, height}
                  },
                },
              });
            },
          );
        });
    }
  }
});

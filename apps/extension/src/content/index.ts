import { logger } from "@shared/lib/logger";
import { formatShortcut } from "@shared/lib/shortcuts";
import { getShortcuts } from "@shared/storage";
import { DEFAULT_SHORTCUTS, type ShortcutAction } from "@shared/types";
import { mountOverlay } from "./lib/mount-overlay";

logger.debug("Pickle Content Script Loaded");

// 캡쳐 시작 및 메타데이터 요청 수신
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  const isTopFrame = window === window.top;

  if (request.action === "START_CAPTURE") {
    if (isTopFrame) {
      startCapture();
    }
    return false;
  }

  if (request.action === "GET_METADATA") {
    try {
      const metadata = extractMetadata();
      sendResponse(metadata);
    } catch (e) {
      logger.error("Metadata extraction failed", { error: e });
      sendResponse(null);
    }
    return true;
  }

  if (request.action === "GET_SELECTION") {
    sendResponse({ text: window.getSelection()?.toString() || "" });
    return true;
  }

  if (request.action === "OPEN_OVERLAY") {
    try {
      logger.info("[Content] OPEN_OVERLAY received", {
        tabId: request.tabId,
        isTopFrame,
        url: window.location.href,
      });

      if (isTopFrame) {
        if (request.tabId) {
          mountOverlay(request.tabId);
          sendResponse({ status: "opened", success: true });
        } else {
          sendResponse({ status: "error", error: "No tabId provided" });
        }
      } else {
        // 최상위 프레임이 아니면 응답만 보내고 무시
        sendResponse({ status: "ignored", reason: "Not top frame" });
      }
    } catch (e) {
      logger.error("[Content] Failed to mount overlay via message", {
        error: e,
      });
      sendResponse({ status: "error", error: (e as Error).message });
    }
    return true;
  }

  if (request.action === "NOTIFY_SYNC") {
    if (isTopFrame) {
      window.postMessage({ type: "PICKLE_SYNC_REQUEST" }, "*");
      logger.debug("[Content] NOTIFY_SYNC delivered to host window");
    }
    return false;
  }

  return false;
});

/**
 * 🚀 안전한 메시지 전송 유틸리티
 * - 익스텐션 컨텍스트 무효화 확인
 * - 데이터 직렬화 보장 (Deep Clone)
 * - lastError 통합 로깅
 */
function safeSendMessage(
  message: Record<string, unknown>,
  callback?: (response: {
    success?: boolean;
    tabId?: number;
    error?: unknown;
  }) => void,
) {
  if (typeof chrome === "undefined" || !chrome.runtime?.id) {
    logger.warn("Extension context invalidated or chrome not available.");
    return;
  }

  try {
    const serializable = JSON.parse(JSON.stringify(message));
    chrome.runtime.sendMessage(
      serializable,
      (response: { success?: boolean; tabId?: number; error?: unknown }) => {
        if (chrome.runtime.lastError) {
          const error = chrome.runtime.lastError.message;
          if (error?.includes("context invalidated")) {
            logger.warn(
              "Extension context invalidated. Please refresh the page.",
            );
          } else {
            logger.warn("Message response error", { error });
          }
        }
        callback?.(response);
      },
    );
  } catch (err) {
    const errorStr = err instanceof Error ? err.message : JSON.stringify(err);
    logger.error(`sendMessage failure: ${errorStr}`);
  }
}

// 단축키 감시 및 실행 (이미지 단축키 제외 - 패널에서만 지원)
function initShortcutListener() {
  const isTopFrame = window === window.top;
  logger.debug(
    `[Pickle] initShortcutListener started (isTopFrame: ${isTopFrame})`,
  );

  let shortcuts = DEFAULT_SHORTCUTS;

  getShortcuts()
    .then((saved) => {
      shortcuts = saved;
    })
    .catch((err) => {
      logger.warn("Failed to load shortcuts, using defaults", { error: err });
    });

  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === "sync" && changes.user_shortcuts) {
      shortcuts = changes.user_shortcuts.newValue as typeof shortcuts;
      logger.info("Shortcuts updated in real-time", shortcuts);
    }
  });

  window.addEventListener(
    "keydown",
    (e) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      const currentCombo = formatShortcut(e);
      const action = Object.entries(shortcuts).find(([_, combo]) => {
        if (typeof combo !== "string") return false;
        const normalizedCombo = combo.replace("Ctrl+", "Cmd+");
        const normalizedCurrent = currentCombo.replace("Ctrl+", "Cmd+");
        return normalizedCombo === normalizedCurrent || combo === currentCombo;
      })?.[0] as ShortcutAction | undefined;

      if (action) {
        e.preventDefault();
        e.stopPropagation();

        logger.info(`[Pickle] Shortcut matched: ${action}`, {
          combo: currentCombo,
        });

        let metadata = null;
        try {
          metadata = extractMetadata();
        } catch (_err) {}

        const selection = window.getSelection();
        const selectionText = selection?.toString() || "";

        const message: Record<string, unknown> = {
          action: `RUN_${action.toUpperCase()}_FLOW`,
          fromShortcut: true,
          selectionText: selectionText,
          url: window.location.href,
          metadata,
        };

        safeSendMessage(message, (response) => {
          if (response?.success && response.tabId) {
            if (isTopFrame && action !== "capture") {
              mountOverlay(response.tabId);
            }
          } else if (response?.error) {
            const errorStr =
              typeof response.error === "object"
                ? JSON.stringify(response.error)
                : String(response.error);
            logger.error(`Action flow failed: ${errorStr}`);
          }
        });
      }
    },
    true, // Capture Phase
  );
}

try {
  initShortcutListener();
  logger.debug("Content script initialized successfully");
} catch (err) {
  logger.error("Failed to initialize shortcut listener", { error: err });
}

function extractMetadata() {
  const resolveUrl = (url: string | null | undefined) => {
    if (!url) return "";
    try {
      return new URL(url, document.baseURI).href;
    } catch {
      return url;
    }
  };

  const getMeta = (property: string) => {
    return (
      document
        .querySelector(`meta[property="${property}"]`)
        ?.getAttribute("content") ||
      document
        .querySelector(`meta[name="${property}"]`)
        ?.getAttribute("content")
    );
  };

  const getFavicon = () => {
    // 1. Try different link selectors
    const selectors = [
      "link[rel~='icon']", // ~=를 사용하여 'shortcut icon' 등도 포함
      "link[rel~='shortcut']",
      "link[rel~='apple-touch-icon']",
    ];

    for (const selector of selectors) {
      const link = document.querySelector(selector) as HTMLLinkElement;
      if (link?.href) {
        try {
          return new URL(link.href, document.baseURI).href;
        } catch {
          return link.href;
        }
      }
    }

    // 2. Fallback to /favicon.ico on the current origin
    return `${window.location.origin}/favicon.ico`;
  };

  try {
    return {
      title: getMeta("og:title") || getMeta("twitter:title") || document.title,
      description:
        getMeta("og:description") ||
        getMeta("twitter:description") ||
        getMeta("description") ||
        "",
      image: resolveUrl(getMeta("og:image") || getMeta("twitter:image")),
      site_name: getMeta("og:site_name") || window.location.hostname,
      favicon: getFavicon(),
      url: window.location.href,
    };
  } catch (err) {
    logger.error("extractMetadata failed", { error: err });
    return {
      title: document.title,
      url: window.location.href,
      favicon: getFavicon(),
    };
  }
}

function startCapture() {
  // 실제 커서 숨기기
  document.body.style.cursor = "none";

  // 커스텀 커서 생성
  const customCursor = document.createElement("div");
  customCursor.id = "pickle-custom-cursor";
  customCursor.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <!-- 원형 (14x14, 중앙 배치) -->
      <circle cx="12" cy="12" r="7" fill="rgba(255,255,255,0.1)" stroke="#888888" stroke-width="1"/>
      <!-- 십자가 (24x24) -->
      <line x1="12" y1="0" x2="12" y2="24" stroke="#D0D0D0" stroke-opacity="0.7" stroke-width="1"/>
      <line x1="0" y1="12" x2="24" y2="12" stroke="#D0D0D0" stroke-opacity="0.7" stroke-width="1"/>
    </svg>
  `;
  customCursor.style.cssText = `
    position: fixed;
    pointer-events: none;
    z-index: 1000001;
    transform: translate(-50%, -50%);
    mix-blend-mode: difference;
  `;
  document.body.appendChild(customCursor);

  // 커서 위치 업데이트 함수
  const updateCursor = (e: MouseEvent) => {
    customCursor.style.left = `${e.clientX}px`;
    customCursor.style.top = `${e.clientY}px`;
  };
  document.addEventListener("mousemove", updateCursor);

  // Overlay 생성
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "transparent";
  overlay.style.zIndex = "999999";
  overlay.style.display = "flex";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";
  overlay.id = "pickle-capture-overlay";
  overlay.tabIndex = -1; // 키보드 이벤트를 확실히 받기 위해 포커스 가능하게 설정

  document.body.appendChild(overlay);
  overlay.focus({ preventScroll: true }); // 생성 즉시 포커스, 스크롤 점프 방지

  // Selection Box 생성
  const selectionBox = document.createElement("div");
  selectionBox.style.position = "fixed";
  selectionBox.style.border = "2px solid oklch(0.84696 0.12489 168.53673)"; // Green color
  selectionBox.style.backgroundColor = "rgba(162, 162, 162, 0.24)";
  selectionBox.style.zIndex = "1000000";
  selectionBox.style.display = "none";
  document.body.appendChild(selectionBox);

  let startX = 0;
  let startY = 0;
  let isDragging = false;

  const onMouseDown = (e: MouseEvent) => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;

    selectionBox.style.left = `${startX}px`;
    selectionBox.style.top = `${startY}px`;
    selectionBox.style.width = "0px";
    selectionBox.style.height = "0px";
    selectionBox.style.display = "block";

    e.preventDefault();
    e.stopPropagation();
  };

  const onMouseMove = (e: MouseEvent) => {
    // 커서 위치 업데이트는 항상 실행
    if (!isDragging) return;

    const currentX = e.clientX;
    const currentY = e.clientY;

    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);
    const left = Math.min(startX, currentX);
    const top = Math.min(startY, currentY);

    selectionBox.style.width = `${width}px`;
    selectionBox.style.height = `${height}px`;
    selectionBox.style.left = `${left}px`;
    selectionBox.style.top = `${top}px`;

    e.preventDefault();
    e.stopPropagation();
  };

  // ESC 키 핸들러
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      cleanup();
      logger.debug("Capture cancelled by ESC key");
    }
  };

  // 정리 함수 (공통 로직)
  const cleanup = () => {
    if (document.body.contains(overlay)) document.body.removeChild(overlay);
    if (document.body.contains(selectionBox))
      document.body.removeChild(selectionBox);
    if (document.body.contains(customCursor))
      document.body.removeChild(customCursor);
    document.body.style.cursor = "default";

    overlay.removeEventListener("mousedown", onMouseDown);
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
    window.removeEventListener("keydown", onKeyDown, true);
    document.removeEventListener("keydown", onKeyDown, true);
    document.removeEventListener("mousemove", updateCursor);
  };

  const onMouseUp = () => {
    if (!isDragging) return;
    isDragging = false;

    const rect = selectionBox.getBoundingClientRect();

    // 정리
    cleanup();

    // 너무 작은 영역(실수 클릭) 무시
    if (rect.width < 10 || rect.height < 10) {
      logger.debug("Capture area too small, ignoring");
      return;
    }

    // 화면이 업데이트(Overlay 제거)된 후 메시지 전송
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        safeSendMessage({
          action: "CAPTURE_AREA",
          area: {
            x: rect.x * window.devicePixelRatio,
            y: rect.y * window.devicePixelRatio,
            width: rect.width * window.devicePixelRatio,
            height: rect.height * window.devicePixelRatio,
          },
          pageUrl: window.location.href,
          timestamp: Date.now(),
        });
      });
    });
  };

  // 이벤트 등록
  overlay.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
  window.addEventListener("keydown", onKeyDown, true);
  document.addEventListener("keydown", onKeyDown, true);
}

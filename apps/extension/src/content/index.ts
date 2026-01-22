import { logger } from "@shared/lib/logger";
import { formatShortcut } from "@shared/lib/shortcuts";
import { getShortcuts } from "@shared/storage";
import type { ShortcutAction } from "@shared/types";

logger.info("Pickle Content Script Loaded");

// 단축키 감시 및 실행
async function initShortcutListener() {
  let shortcuts = await getShortcuts();
  let lastHoveredImage: { src: string; alt: string } | null = null;

  // 실시간 단축키 업데이트 감지
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === "sync" && changes.user_shortcuts) {
      shortcuts = changes.user_shortcuts.newValue as typeof shortcuts;
      logger.info("Shortcuts updated in real-time", shortcuts);
    }
  });

  // 이미지 호버 추적
  window.addEventListener(
    "mouseover",
    (e) => {
      const target = e.target as HTMLElement;
      if (target instanceof HTMLImageElement) {
        lastHoveredImage = {
          src: target.src,
          alt: target.alt || target.title || "",
        };
      }
    },
    { passive: true },
  );

  window.addEventListener(
    "keydown",
    (e) => {
      // 입력 필드(input, textarea)나 contenteditable 요소에서는 단축키 무시
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      const currentCombo = formatShortcut(e);
      logger.info("Key pressed", { combo: currentCombo });

      // 매칭되는 단축키 찾기
      const action = Object.entries(shortcuts).find(([_, combo]) => {
        if (typeof combo !== "string") return false;
        // Mac/Windows 간의 Ctrl/Cmd 호환성 처리 (저장된 값이 Ctrl이어도 Mac에서는 Cmd로 매칭 허용)
        const normalizedCombo = combo.replace("Ctrl+", "Cmd+");
        const normalizedCurrent = currentCombo.replace("Ctrl+", "Cmd+");
        return normalizedCombo === normalizedCurrent || combo === currentCombo;
      })?.[0] as ShortcutAction | undefined;

      if (action) {
        e.preventDefault();
        e.stopPropagation();

        logger.debug("Shortcut matched", { action, combo: currentCombo });

        const message: {
          action: string;
          fromShortcut: boolean;
          imageData?: { src: string; alt: string };
        } = {
          action: `RUN_${action.toUpperCase()}_FLOW`,
          fromShortcut: true,
        };

        // 이미지 저장 단축키인 경우 호버된 이미지 정보 포함
        if (action === "image" && lastHoveredImage) {
          message.imageData = lastHoveredImage;
        }

        // 백그라운드에 액션 요청
        try {
          chrome.runtime.sendMessage(message, (response) => {
            if (chrome.runtime.lastError) {
              logger.warn(
                "Extension connection lost. Please refresh the page.",
                {
                  error: chrome.runtime.lastError.message,
                },
              );
            } else {
              logger.info("Action requested successfully", {
                action,
                response,
              });
            }
          });
        } catch (err) {
          logger.error("Failed to send message to extension", { error: err });
          logger.info(
            "TIP: If you just updated the extension, please refresh this tab.",
          );
        }
      }
    },
    true, // capture phase에서 먼저 낚아챔
  );
}

initShortcutListener();

// 캡쳐 및 메타데이터 요청 수신
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === "START_CAPTURE") {
    startCapture();
  } else if (request.action === "GET_METADATA") {
    try {
      const metadata = extractMetadata();
      sendResponse(metadata);
    } catch (e) {
      logger.error("Metadata extraction failed", { error: e });
      sendResponse(null);
    }
  } else if (request.action === "GET_SELECTION") {
    sendResponse({ text: window.getSelection()?.toString() || "" });
  }
});

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
      "link[rel='icon']",
      "link[rel='shortcut icon']",
      "link[rel='apple-touch-icon']",
    ];

    for (const selector of selectors) {
      const link = document.querySelector(selector) as HTMLLinkElement;
      if (link?.href) {
        return link.href; // href is absolute
      }
    }

    // 2. Fallback to default /favicon.ico
    return `https://www.google.com/s2/favicons?domain=${window.location.hostname}&sz=64`;
  };

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
  overlay.focus(); // 생성 즉시 포커스

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
        chrome.runtime.sendMessage({
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

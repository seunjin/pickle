import { OVERLAY_DIMENSIONS } from "@shared/layout";
import { logger } from "@shared/lib/logger";

const MOUNT_ID = "pickle-overlay-root";

/**
 * Overlay Mounting Logic
 */
export function mountOverlay(tabId: number) {
  logger.debug("Attempting to mount overlay for tab", { tabId });
  const existing = document.getElementById(MOUNT_ID);
  if (existing) {
    logger.debug("Overlay already exists");
    return;
  }

  const iframe = document.createElement("iframe");
  iframe.id = MOUNT_ID;

  const overlayUrl = chrome.runtime.getURL(
    `src/overlay/index.html?tabId=${tabId}`,
  );
  iframe.src = overlayUrl;

  iframe.style.position = "fixed";
  iframe.style.top = `${OVERLAY_DIMENSIONS.margin}px`;
  iframe.style.right = `${OVERLAY_DIMENSIONS.margin}px`;
  iframe.style.left = "auto";

  const totalWidth = OVERLAY_DIMENSIONS.width;

  iframe.style.width = `${totalWidth}px`;
  iframe.style.height = `calc(100vh - ${OVERLAY_DIMENSIONS.margin * 2}px)`;
  iframe.style.zIndex = "2147483647";
  iframe.style.boxShadow = "0 4px 12px 0px rgba(0, 0, 0, 0.7)";
  iframe.style.border = "1px solid oklch(0.31317 0 0)";
  iframe.style.backgroundColor = "#1F1F1F";
  iframe.style.borderRadius = "16px";
  iframe.style.pointerEvents = "auto";

  document.documentElement.appendChild(iframe);

  const handleMessage = (event: MessageEvent) => {
    if (event.data?.type === "PICKLE_CLOSE_OVERLAY") {
      iframe.remove();
      window.removeEventListener("message", handleMessage);
    }
  };
  window.addEventListener("message", handleMessage);

  const handleEsc = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      iframe.remove();
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("keydown", handleEsc);
    }
  };
  window.addEventListener("keydown", handleEsc);
}

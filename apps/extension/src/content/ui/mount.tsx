import { OVERLAY_DIMENSIONS } from "@shared/layout";

const MOUNT_ID = "pickle-overlay-root";

export function mountOverlay(tabId: number) {
  const existing = document.getElementById(MOUNT_ID);
  if (existing) {
    return;
  }

  const iframe = document.createElement("iframe");
  iframe.id = MOUNT_ID;

  // Create URL with tabId query param
  const overlayUrl = chrome.runtime.getURL(
    `src/overlay/index.html?tabId=${tabId}`,
  );
  iframe.src = overlayUrl;

  iframe.style.position = "fixed";
  iframe.style.top = `${OVERLAY_DIMENSIONS.margin}px`;
  iframe.style.right = `${OVERLAY_DIMENSIONS.margin}px`;
  iframe.style.left = "auto";
  // Width/Height includes content + shadow buffer if necessary,
  // but since OverlayApp handles shadow internal to the div,
  // and we want exact sizing, we might need the iframe to be just the content size
  // IF the shadow is 'inset' or if we want the shadow to be visible outside, we need more space.
  // Given current 'shadow-2xl', it extends OUTSIDE.
  // So Iframe needs to be slightly larger or we change shadow strategy.
  // For now, setting Iframe to exact requested content size (360x600) + small buffer for shadow to appear.
  const totalWidth = OVERLAY_DIMENSIONS.width + OVERLAY_DIMENSIONS.shadowBuffer;
  const totalHeight =
    OVERLAY_DIMENSIONS.height + OVERLAY_DIMENSIONS.shadowBuffer;

  iframe.style.width = `${totalWidth}px`;
  iframe.style.height = `${totalHeight}px`;
  iframe.style.zIndex = "2147483647";
  iframe.style.border = "none";
  iframe.style.backgroundColor = "transparent";
  // Important: allow pointer events to pass through, but children in iframe will block
  // However, for iframe, 'pointer-events: none' on iframe element makes the WHOLE iframe unclickable.
  // We want the iframe to be clickable where the UI is.
  // Since we can't do pixel-perfect click-through for cross-origin (even extension-origin) easily without 'allow-transparency' tricks which are deprecated,
  // Or we just overlay the WHOLE screen with the iframe.
  // In overlay.html, we set #root { pointer-events: none } and #root > * { pointer-events: auto }.
  // So the iframe element itself MUST have pointer-events: auto to receive clicks.
  iframe.style.pointerEvents = "auto";

  document.documentElement.appendChild(iframe);

  // Listen for Close Message from Iframe
  const handleMessage = (event: MessageEvent) => {
    if (event.data?.type === "PICKLE_CLOSE_OVERLAY") {
      iframe.remove();
      window.removeEventListener("message", handleMessage);
    }
  };
  window.addEventListener("message", handleMessage);
}

// Global Message Listener for Opening Overlay
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === "OPEN_OVERLAY") {
    // Background에서 tabId를 함께 보내줘야 함
    if (request.tabId) {
      mountOverlay(request.tabId);
    } else {
      console.error("Tab ID missing in OPEN_OVERLAY request");
    }
    sendResponse({ status: "opened" });
  }
});

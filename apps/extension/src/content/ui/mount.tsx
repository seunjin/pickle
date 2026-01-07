import { OVERLAY_DIMENSIONS } from "@shared/layout";
import { extensionRuntime } from "@shared/lib/extension-api";

const MOUNT_ID = "pickle-overlay-root";

export function mountOverlay(tabId: number) {
  const existing = document.getElementById(MOUNT_ID);
  if (existing) {
    return;
  }

  const iframe = document.createElement("iframe");
  iframe.id = MOUNT_ID;

  // Create URL with tabId query param
  const overlayUrl = extensionRuntime.getURL(
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
  const totalWidth = OVERLAY_DIMENSIONS.width;

  iframe.style.width = `${totalWidth}px`;
  iframe.style.height = `calc(100vh - ${OVERLAY_DIMENSIONS.margin * 2}px)`;
  iframe.style.zIndex = "2147483647";
  iframe.style.boxShadow = "0 4px 12px 0px rgba(0, 0, 0, 0.7)"; //shadow-standard
  iframe.style.border = "1px solid oklch(0.31317 0 0)"; //border border-base-border-light
  iframe.style.backgroundColor = "oklch(0.23929 0 0)"; //bg-neutral-850
  iframe.style.borderRadius = "16px"; //rounded-2xl
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
extensionRuntime.onMessage.addListener(
  (request: any, _sender: any, sendResponse: (response?: any) => void) => {
    if (request.action === "OPEN_OVERLAY") {
      if (request.tabId) {
        mountOverlay(request.tabId);
      } else {
        console.error("Tab ID missing in OPEN_OVERLAY request");
      }
      sendResponse({ status: "opened" });
      return true;
    }
    return undefined;
  },
);

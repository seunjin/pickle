import { createRoot } from "react-dom/client";
import styles from "../index.css?inline"; // CSS를 문자열로 가져옴
import OverlayApp from "./OverlayApp";

const MOUNT_ID = "pickle-note-overlay-root";

export function mountOverlay(tabId: number) {
  const existing = document.getElementById(MOUNT_ID);
  if (existing) {
    // 이미 존재하면 닫지 않고 유지 (상태 업데이트는 React가 storage listener로 처리)
    return;
  }

  const host = document.createElement("div");
  host.id = MOUNT_ID;
  host.style.position = "fixed";
  host.style.top = "0";
  host.style.right = "0";
  host.style.zIndex = "2147483647";
  host.style.width = "0";
  host.style.height = "0";

  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: "closed" });

  // 스타일 주입
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  shadow.appendChild(styleSheet);

  const rootContainer = document.createElement("div");
  shadow.appendChild(rootContainer);

  const root = createRoot(rootContainer);

  const handleClose = () => {
    root.unmount();
    host.remove();
  };

  root.render(<OverlayApp onClose={handleClose} tabId={tabId} />);
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

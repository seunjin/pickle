import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../index.css"; // Global Tailwind styles are Safe here!
import OverlayApp from "../content/ui/OverlayApp";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

// Parse tabId from URL query params (passed by mount.tsx)
const params = new URLSearchParams(window.location.search);
const tabId = Number(params.get("tabId"));

if (!tabId) {
  console.error("Tab ID missing in Overlay Iframe URL");
}

createRoot(root).render(
  <StrictMode>
    <OverlayApp
      onClose={() => {
        // Send close message to Parent (Content Script)
        window.parent.postMessage({ type: "PICKLE_CLOSE_OVERLAY" }, "*");
      }}
      tabId={tabId}
    />
  </StrictMode>,
);

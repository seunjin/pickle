import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { DialogProvider } from "@pickle/ui";
import { PopupApp } from "./popup/PopupApp";
import { DevLauncher } from "./shared/components/DevLauncher";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

createRoot(root).render(
  <StrictMode>
    <DialogProvider>
      <PopupApp />
      <DevLauncher />
    </DialogProvider>
  </StrictMode>,
);

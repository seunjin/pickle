import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { DialogProvider } from "@pickle/lib";
import App from "./App.tsx";
import { DevLauncher } from "./shared/components/DevLauncher";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

createRoot(root).render(
  <StrictMode>
    <DialogProvider>
      <App />
      <DevLauncher />
    </DialogProvider>
  </StrictMode>,
);

"use client";
import { Toaster as SonnerToaster } from "sonner";
import "./toast.css";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      style={{ display: "flex", justifyContent: "center" }}
      toastOptions={{
        classNames: {
          title: "pickle-toast-title",
          description: "pickle-toast-description",
          actionButton: "pickle-toast-action-btn",
          closeButton: "pickle-toast-close-btn",
          success: "pickle-toast-success",
          error: "pickle-toast-error",
          info: "pickle-toast-info",
        },
      }}
    />
  );
}

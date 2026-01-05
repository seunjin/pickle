import { toast as sonnerToast } from "sonner";
import type { ToastAction, ToastKind } from "../types";

export interface ToastCardProps {
  id: string | number;
  kind: ToastKind;
  title: string;
  description?: string;
  action?: ToastAction;
  cancel?: ToastAction;
}

export function ToastCard({
  id,
  kind,
  title,
  description,
  action,
  cancel,
}: ToastCardProps) {
  const handleClose = () => sonnerToast.dismiss(id);

  const kindStyles: Record<ToastKind, string> = {
    info: "pickle-toast-info",
    success: "pickle-toast-success",
    error: "pickle-toast-error",
    loading: "pickle-toast-loading",
  };

  return (
    <div className={`pickle-toast-card ${kindStyles[kind]}`}>
      <div className="pickle-toast-content">
        <h4 className="pickle-toast-title">
          {kind === "loading" && <span className="pickle-toast-spinner" />}
          {title}
        </h4>
        {description && (
          <p className="pickle-toast-description">{description}</p>
        )}
        {(action || cancel) && (
          <div className="pickle-toast-actions">
            {action && (
              <button
                type="button"
                className="pickle-toast-action-btn"
                onClick={async () => {
                  await action.onClick();
                  handleClose();
                }}
              >
                {action.label}
              </button>
            )}
            {cancel && (
              <button
                type="button"
                className="pickle-toast-close-btn"
                onClick={async () => {
                  await cancel.onClick();
                  handleClose();
                }}
              >
                {cancel.label}
              </button>
            )}
          </div>
        )}
      </div>
      <button
        type="button"
        className="pickle-toast-close-icon-btn"
        onClick={handleClose}
        aria-label="Close"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <title>Close</title>
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  );
}

export type ToastKind = "info" | "success" | "error" | "loading";

export type ToastState = "entering" | "visible" | "leaving";

export type ToastAction = {
  label: string;
  onClick: () => void | Promise<void>;
};

export type ToastOptions = {
  description?: string;
  durationMs?: number;
  dismissible?: boolean;
  action?: ToastAction;
  cancel?: ToastAction;
  dedupeKey?: string;
};

export type ToastProps = {
  title: string;
} & ToastOptions;

export type ToastItem = {
  id: string | number;
  kind: ToastKind;
  state: ToastState;
  createdAt: number;
  closeAt?: number;
} & ToastProps;

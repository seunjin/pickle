export type ToastKind = "info" | "success" | "error" | "loading";

export type ToastState = "entering" | "visible" | "leaving";

export type ToastAction = {
  label: string;
  onClick: () => void | Promise<void>;
};

export type ToastItem = {
  id: string;
  kind: ToastKind;
  title: string;
  description?: string;
  state: ToastState;

  // UX policy
  durationMs: number;
  dismissible: boolean;
  createdAt: number;
  closeAt?: number;

  // optional action(s)
  action?: ToastAction;
  cancel?: ToastAction;

  // dedupe
  dedupeKey?: string;
};

export type ToastOptions = Partial<
  Pick<
    ToastItem,
    | "description"
    | "durationMs"
    | "dismissible"
    | "action"
    | "cancel"
    | "dedupeKey"
  >
>;

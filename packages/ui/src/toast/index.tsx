import { toast as sonnerToast } from "sonner";
import type { ToastKind, ToastOptions } from "./types";
import { ToastCard } from "./ui/ToastCard";

function createToast(kind: ToastKind, title: string, opts?: ToastOptions) {
  return sonnerToast.custom(
    (id) => (
      <ToastCard
        id={id}
        kind={kind}
        title={title}
        description={opts?.description}
        action={opts?.action}
        cancel={opts?.cancel}
      />
    ),
    {
      id: opts?.dedupeKey,
      duration: opts?.durationMs,
    },
  );
}

export const toast = {
  info(title: string, opts?: ToastOptions) {
    return createToast("info", title, opts);
  },
  success(title: string, opts?: ToastOptions) {
    return createToast("success", title, opts);
  },
  error(title: string, opts?: ToastOptions) {
    return createToast("error", title, opts);
  },
  loading(title: string, opts?: ToastOptions) {
    return createToast("loading", title, opts);
  },

  update(
    id: string | number,
    patch: Partial<ToastOptions> & { title?: string; kind?: ToastKind },
  ) {
    return sonnerToast.custom(
      (id) => (
        <ToastCard
          id={id}
          kind={patch.kind || "info"}
          title={patch.title || ""}
          description={patch.description}
          action={patch.action}
          cancel={patch.cancel}
        />
      ),
      {
        id,
        duration: patch.durationMs,
      },
    );
  },

  dismiss(id?: string | number) {
    return sonnerToast.dismiss(id);
  },

  clearAll() {
    return sonnerToast.dismiss();
  },

  async promise<T>(
    promise: Promise<T>,
    msgs: { loading: string; success: string; error: string },
    opts?: ToastOptions,
  ) {
    const id = this.loading(msgs.loading, opts);
    try {
      const result = await promise;
      this.update(id, {
        kind: "success",
        title: msgs.success,
        durationMs: 3000,
      });
      return result;
    } catch (err) {
      this.update(id, {
        kind: "error",
        title: msgs.error,
        durationMs: 5000,
      });
      throw err;
    }
  },

  undo(args: {
    title: string;
    description?: string;
    actionLabel?: string;
    onUndo: () => void | Promise<void>;
    onUndoSuccessTitle?: string;
  }) {
    return this.info(args.title, {
      description: args.description,
      action: {
        label: args.actionLabel ?? "실행 취소",
        onClick: async () => {
          const promise = (async () => {
            await args.onUndo();
          })();
          this.promise(promise, {
            loading: "복구 중...",
            success: args.onUndoSuccessTitle ?? "복구되었습니다.",
            error: "복구에 실패했습니다.",
          });
        },
      },
    });
  },
};

export function useToast() {
  return toast;
}

export { Toaster } from "./Toaster";
export type * from "./types";

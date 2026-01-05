"use client";
import { toast as sonnerToast } from "sonner";

/**
 * [중요] 토스트 인스턴스 단일화 (Singleton)
 * 모노레포 및 번들링 환경에서 sonner 인스턴스가 파편화되는 것을 방지하기 위해
 * 이 파일에서 생성된 인스턴스를 모든 곳(특히 ToastCard)에서 공유합니다.
 */
export { sonnerToast as toastInstance };

import { ToastCard } from "./ToastCard";
import type { ToastKind, ToastProps } from "./types";

function createToast(kind: ToastKind, props: ToastProps) {
  /**
   * [중요] 명시적 고유 ID 부여
   * sonner의 자동 ID(숫자)는 React StrictMode나 커스텀 컴포넌트 환경에서
   * 엔진과 컴포넌트 간의 ID 미스매치를 유발할 수 있어 crypto.randomUUID()를 사용합니다.
   */
  const manualId = props.dedupeKey || crypto.randomUUID();

  return sonnerToast.custom(
    (id) => <ToastCard id={id} kind={kind} {...props} />,
    {
      id: manualId,
      duration: props.durationMs,
    },
  );
}

export const toast = {
  info(props: ToastProps) {
    return createToast("info", props);
  },
  success(props: ToastProps) {
    return createToast("success", props);
  },
  error(props: ToastProps) {
    return createToast("error", props);
  },
  loading(props: ToastProps) {
    return createToast("loading", props);
  },

  update(
    id: string | number,
    patch: Partial<ToastProps> & { kind?: ToastKind },
  ) {
    return sonnerToast.custom(
      (_id) => (
        <ToastCard
          id={_id}
          kind={patch.kind || "info"}
          {...(patch as ToastProps)}
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
    opts?: Omit<ToastProps, "title">,
  ) {
    const id = this.loading({ title: msgs.loading, ...opts });
    try {
      const result = await promise;
      this.update(id, {
        kind: "success",
        title: msgs.success,
        durationMs: 3000,
        ...opts,
      });
      return result;
    } catch (err) {
      this.update(id, {
        kind: "error",
        title: msgs.error,
        durationMs: 5000,
        ...opts,
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
    return this.info({
      title: args.title,
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

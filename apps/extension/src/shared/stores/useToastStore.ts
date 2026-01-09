import type { ToastKind } from "@pickle/ui";
import { create } from "zustand";

interface ToastState {
  title: string;
  kind: ToastKind;
  durationMs?: number;
}

interface ToastStore {
  toast: ToastState | null;
  showToast: (state: ToastState) => void;
  hideToast: () => void;
}

/**
 * Extension 전용 Toast 글로벌 스토어
 * 하위 컴포넌트에서 useToastStore().showToast()로 토스트 호출 가능
 */
export const useToastStore = create<ToastStore>((set) => ({
  toast: null,
  showToast: (state) => set({ toast: state }),
  hideToast: () => set({ toast: null }),
}));

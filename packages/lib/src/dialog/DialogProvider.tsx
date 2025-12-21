"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { DialogStore, DialogsRenderer } from "react-layered-dialog";

const DialogStoreContext = createContext<DialogStore | null>(null);

export interface DialogProviderProps {
  children: ReactNode;
}

/**
 * 다이얼로그 시스템을 위한 프로바이더입니다.
 * 내부적으로 DialogStore를 생성하고 DialogsRenderer를 배치합니다.
 */
export function DialogProvider({ children }: DialogProviderProps) {
  const [store, setStore] = useState<DialogStore | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setStore(new DialogStore());
    setIsMounted(true);
  }, []);

  return (
    <DialogStoreContext.Provider value={store}>
      {children}
      {isMounted && store && <DialogsRenderer store={store} />}
    </DialogStoreContext.Provider>
  );
}

/**
 * DialogStore 인스턴스에 접근하기 위한 내부 훅입니다.
 */
export function useDialogStore() {
  const context = useContext(DialogStoreContext);
  // SSR이나 초기 마운트 전에는 null일 수 있음을 고려하여 에러 처리를 유연하게 하거나
  // 호출부에서 체크하도록 합니다. 여기서는 편의상 에러를 던집니다 (단, 렌더링 중 호출 주의).
  if (!context) {
    return null;
  }
  return context;
}

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
  if (!context) {
    return null;
  }
  return context;
}

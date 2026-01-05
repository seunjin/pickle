import { useMemo } from "react";
import type { DialogStore } from "react-layered-dialog";
import { useDialogController as useBaseDialogController } from "react-layered-dialog";
import { useDialogStore } from "./DialogProvider";

/**
 * 다이얼로그를 열고 닫는 등 앱 어디서나 다이얼로그 시스템을 제어하기 위한 훅입니다.
 * SSR 환경이나 초기 마운트 전 store가 null인 상태에서도 런타임 에러 없이 안전하게 호출할 수 있도록 Proxy가 적용되어 있습니다.
 */
export function useDialog(): DialogStore {
  const store = useDialogStore();

  return useMemo(() => {
    if (store) return store;

    // 초기 마운트 전이나 SSR 시점에 안전하게 호출할 수 있는 Proxy 반환
    return new Proxy({} as DialogStore, {
      get(_, prop) {
        // 메서드가 호출되면 경고를 남기고 아무 동작도 하지 않음
        return () => {
          console.warn(
            `[DialogSystem] '${String(prop)}' 호출 시점에 아직 Store가 준비되지 않았습니다. 마운트 이후에 호출하거나 store 존재 여부를 확인해주세요.`,
          );
        };
      },
    });
  }, [store]);
}

/**
 * 다이얼로그 내부 컴포넌트에서 자신의 상태를 제어하기 위한 훅입니다.
 */
export const useDialogController = useBaseDialogController;

import { useDialogController as useBaseDialogController } from "react-layered-dialog";
import { useDialogStore } from "./DialogProvider";

/**
 * 다이얼로그를 열고 닫는 등 앱 어디서나 다이얼로그 시스템을 제어하기 위한 훅입니다.
 */
export function useDialog() {
  const store = useDialogStore();
  return store;
}

/**
 * 다이얼로그 내부 컴포넌트에서 자신의 상태를 제어하기 위한 훅입니다.
 */
export const useDialogController = useBaseDialogController;

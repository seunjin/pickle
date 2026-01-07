import { ToastCard, type ToastKind, type ToastProps } from "@pickle/ui";
import { motion } from "motion/react";
import { useEffect } from "react";

interface OverlayToastProps extends ToastProps {
  kind: ToastKind;
  onClose: () => void;
  className?: string; // 위치 조정을 위해 className 지원
}

/**
 * OverlayToast Component
 *
 * 익스텐션 오버레이 내부에서 sonner(포탈) 없이 직접 렌더링하기 위한 컴포넌트입니다.
 * OverlayApp의 하단이나 상단에 absolute로 고정하여 좁은 iframe 환경에서도
 * 원하는 위치에 안정적으로 토스트를 띄울 수 있게 합니다.
 */
export function OverlayToast({
  kind,
  durationMs = 3000,
  onClose,
  className,
  ...props
}: OverlayToastProps) {
  useEffect(() => {
    if (durationMs > 0) {
      const timer = setTimeout(onClose, durationMs);
      return () => clearTimeout(timer);
    }
  }, [durationMs, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: "50%", x: "-50%" }}
      animate={{ opacity: 1, y: 0, x: "-50%" }}
      exit={{ opacity: 0, y: "50%", x: "-50%" }}
      transition={{ duration: 0.2 }}
      className={`absolute left-[50%] z-100 ${className || "bottom-16"}
      `}
    >
      <ToastCard id="overlay-toast" kind={kind} onClose={onClose} {...props} />
    </motion.div>
  );
}

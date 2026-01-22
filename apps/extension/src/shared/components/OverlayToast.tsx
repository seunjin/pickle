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
 * 프리미엄 UI 경험을 위해 motion/react를 다시 도입했습니다.
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
      className={`absolute left-[50%] z-100 ${className || "bottom-17.5"}`}
    >
      <ToastCard id="overlay-toast" kind={kind} onClose={onClose} {...props} />
    </motion.div>
  );
}

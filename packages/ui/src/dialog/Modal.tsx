"use client";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "../lib/utils";
import { useDialogController } from "./useDialog";

interface ModalProps {
  children?: React.ReactNode;
  useDimmedClickClose?: boolean;
  contentClassName?: HTMLDivElement["className"];
}

export function Modal({
  children,
  useDimmedClickClose = true,
  contentClassName,
}: ModalProps) {
  const { zIndex, isOpen, close, unmount } = useDialogController();

  return (
    <AnimatePresence onExitComplete={unmount}>
      {isOpen && (
        <motion.div
          className={cn("fixed inset-0 flex items-center justify-center")}
          style={{ zIndex }}
        >
          {/* Dimmed */}
          <motion.div
            className="absolute inset-0 bg-base-dimed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={useDimmedClickClose ? close : undefined}
          />

          {/* Dialog Content */}
          <motion.div
            className={cn(
              "relative z-10 flex flex-col items-center gap-4 rounded-[20px] border border-base-border-light bg-base-foreground-background py-[24px_30px] shadow-standard",
              contentClassName,
            )}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

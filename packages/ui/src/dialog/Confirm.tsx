"use client";
import type { VariantProps } from "class-variance-authority";
import { AnimatePresence, motion } from "motion/react";
import { useDialogController } from "react-layered-dialog";
import { Button, type buttonVariants } from "../button";
import { cn } from "../lib/utils";

interface ConfirmProps {
  title?: string;
  content: string;
  onCancel?: () => void;
  onConfirm?: () => void;
  confirmType?: VariantProps<typeof buttonVariants>["variant"];
  cancelButtonText?: string;
  confirmButtonText?: string;
  isPending?: boolean;
}

export function Confirm({
  title,
  content,
  onCancel,
  onConfirm,
  confirmType = "primary",
  cancelButtonText = "취소",
  confirmButtonText = "확인",
  isPending,
}: ConfirmProps) {
  const { zIndex, isOpen, close, unmount } = useDialogController();
  const handleCancel = () => {
    if (onCancel) {
      onCancel?.();
    } else {
      close();
    }
  };
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm?.();
    } else {
      close();
    }
  };
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
          />

          {/* Dialog Content */}
          <motion.div
            className="relative z-10 flex min-w-[260px] flex-col items-center gap-4 rounded-[8px] border border-base-border-light bg-base-foreground-background px-3 pt-5 pb-3 shadow-standard"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="flex w-full flex-col items-center">
              {title && (
                <h3 className="pb-1 font-semibold text-[15px] text-base-foreground leading-[1.3]">
                  {title}
                </h3>
              )}
              <p className="whitespace-pre-line whitespace-pre-line pb-4 text-center text-[14px] text-base-muted-foreground leading-[1.4]">
                {content}
              </p>
              <div className="flex w-full gap-2">
                <Button
                  className="flex-1"
                  variant={"secondary"}
                  size={"h32"}
                  onClick={handleCancel}
                >
                  {cancelButtonText}
                </Button>
                <Button
                  className="flex-1"
                  size={"h32"}
                  isPending={isPending}
                  disabled={isPending}
                  variant={confirmType}
                  onClick={handleConfirm}
                >
                  {confirmButtonText}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

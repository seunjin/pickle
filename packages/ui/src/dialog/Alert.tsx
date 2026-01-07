"use client";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "../button";
import { cn } from "../lib/utils";
import { useDialogController } from "./useDialog";

interface AlertProps {
  title?: string;
  content: string;
  onOk?: () => void;
  okButtonText?: string;
}

export function Alert({
  title,
  content,
  onOk,
  okButtonText = "확인",
}: AlertProps) {
  const { zIndex, isOpen, close, unmount } = useDialogController();

  const handleOk = () => {
    onOk?.();
    close();
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
            className="relative z-10 flex flex-col items-center gap-4 rounded-[16px] border border-base-border-light bg-base-foreground-background px-3 pt-5 pb-3 shadow-standard"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="flex flex-col items-center">
              {title && (
                <h3 className="pb-1 font-semibold text-[14px] text-base-foreground leading-[1.3]">
                  {title}
                </h3>
              )}
              <p className="pb-4 text-center text-[14px] text-base-muted-foreground leading-[1.3]">
                {content}
              </p>
              <Button className="w-full" size={"h32"} onClick={handleOk}>
                {okButtonText}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

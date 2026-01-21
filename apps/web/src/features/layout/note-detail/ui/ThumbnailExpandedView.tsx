"use client";

import type { NoteWithAsset } from "@pickle/contracts";
import { ActionButton } from "@pickle/ui";
import { cn } from "@pickle/ui/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { Thumbnail } from "@/features/note/ui/thumbnail/Thumbnail";

interface ThumbnailExpandedViewProps {
  note: NoteWithAsset;
  isOpen: boolean;
  onClose: () => void;
  hasAssetType: boolean;
  onDownload: () => void;
}

export function ThumbnailExpandedView({
  note,
  isOpen,
  onClose,
  hasAssetType,
  onDownload,
}: ThumbnailExpandedViewProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="relative z-20 grid h-full w-[calc(100dvh-30px)] max-w-[calc(100dvh-30px)] flex-1 grid-rows-[1fr] rounded-[16px] border border-base-border-light bg-base-foreground-background py-5 shadow-standard"
          initial={{ opacity: 0, x: "70%" }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: "70%" }}
          transition={{ duration: 0.3 }}
          onClick={(e) => {
            e.stopPropagation();
          }}
          role="presentation"
        >
          <header className="absolute top-3 right-3 z-10 flex items-center justify-end gap-2">
            {hasAssetType && (
              <ActionButton icon="download_16" onClick={onDownload} />
            )}
            <ActionButton icon="delete_16" onClick={onClose} />
          </header>
          <div className="flex h-full items-center justify-center">
            <Thumbnail
              note={note}
              className={cn("h-full w-full")}
              objectFit="scale-down"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

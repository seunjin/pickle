import type { NoteWithAsset } from "@pickle/contracts";
import { Icon } from "@pickle/icons";
import { useDialogController } from "@pickle/lib";
import { ScrollArea } from "@pickle/ui";
import { cn } from "@pickle/ui/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { type HTMLAttributes, useState } from "react";
import { Thumbnail } from "@/features/note/ui/thumbnail/Thumbnail";

interface NoteDetailDrawerProps {
  note: NoteWithAsset;
}

const TYPE_LABELS: Record<string, string> = {
  text: "TEXT",
  image: "IMAGE",
  capture: "CAPTURE",
  bookmark: "URL",
} as const;

const type_per_class: Record<
  NoteWithAsset["type"],
  HTMLAttributes<"span">["className"]
> = {
  text: "font-medium text-[14px] text-blue-500 tracking-wider",
  image: "font-medium text-[14px] text-green-500 tracking-wider",
  capture: "font-medium text-[14px] text-green-500 tracking-wider",
  bookmark: "font-medium text-[14px] text-yellow-500 tracking-wider",
};

const type_per_icon: Record<
  NoteWithAsset["type"],
  HTMLAttributes<"span">["className"]
> = {
  text: "flex items-center justify-center size-6 rounded-sm bg-blue-500/10",
  image: "flex items-center justify-center size-6 rounded-sm bg-green-500/10",
  capture: "flex items-center justify-center size-6 rounded-sm bg-green-500/10",
  bookmark:
    "flex items-center justify-center size-6 rounded-sm bg-yellow-500/10",
};

export default function NoteDetailDrawer({ note }: NoteDetailDrawerProps) {
  const { isOpen, zIndex, unmount, close } = useDialogController();
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  return (
    <AnimatePresence onExitComplete={unmount}>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-end"
          style={{ zIndex: zIndex }}
        >
          {/* overlay */}
          <motion.div
            className="absolute inset-0 z-10 bg-neutral-950/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
          ></motion.div>

          {/* drawer */}
          <motion.div
            className="relative z-20 mr-[15px] grid h-[calc(100%-30px)] w-90 grid-rows-[auto_1fr_auto] rounded-[16px] border border-base-border-light bg-base-foreground-background py-5"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.2 }}
          >
            {/* drawer header */}
            <header className="flex justify-between px-5 pb-5">
              <span className="inline-flex items-center gap-2 font-semibold text-[18px] text-base-foreground">
                <Icon name="archive" size={20} className="text-inherit" /> Inbox
              </span>
              <button
                type="button"
                className="flex items-center gap-0.5 rounded-[6px] border border-base-border-light bg-neutral-800 px-1.5 text-[12px] text-base-muted-foreground"
              >
                <Icon name="move" size={16} /> 옮기기
              </button>
            </header>

            {/* drawer content */}
            <ScrollArea className="h-full overflow-auto">
              <div className="px-5">
                {/* type : image | capture | bookmark 일때 썸네일 */}

                <Thumbnail
                  note={note}
                  className="mb-5 h-[200px] overflow-clip rounded-xl"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className={type_per_icon[note.type]}>
                      {note.type === "bookmark" && (
                        <img src="/type-01.svg" alt="bookmark type icon" />
                      )}
                      {(note.type === "image" || note.type === "capture") && (
                        <img src="/type-02.svg" alt="img type icon" />
                      )}
                      {note.type === "text" && (
                        <img src="/type-03.svg" alt="text type icon" />
                      )}
                    </div>
                    <span className={type_per_class[note.type]}>
                      {TYPE_LABELS[note.type] || note.type.toUpperCase()}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsBookmarked(!isBookmarked)}
                  >
                    <Icon
                      name="bookmark"
                      size={20}
                      className={cn(
                        "transition-colors group-hover:text-neutral-300",
                        isBookmarked &&
                          "text-base-primary group-hover:text-base-primary",
                      )}
                    />
                  </button>
                </div>

                {/* form */}
                <div>{/* title */}</div>
                <div className="h-[1000px]"></div>
              </div>
            </ScrollArea>
            {/* drawer footer */}
            <div className="px-5">
              <button type="button">테스트</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

"use client";

import type { NoteWithAsset } from "@pickle/contracts";
import { cn } from "@pickle/ui/lib/utils";
import { Thumbnail } from "@/features/note/ui/thumbnail/Thumbnail";

interface NoteThumbnailViewProps {
  note: NoteWithAsset;
  canExpand: boolean;
  onExpand: () => void;
}

export function NoteThumbnailView({
  note,
  canExpand,
  onExpand,
}: NoteThumbnailViewProps) {
  return (
    <div className="px-5">
      <button
        type="button"
        disabled={!canExpand}
        className={cn(
          "w-full rounded-xl text-left outline-none focus-visible:ring-2 focus-visible:ring-base-primary",
          canExpand ? "cursor-pointer" : "cursor-default",
        )}
        onClick={onExpand}
      >
        <Thumbnail
          note={note}
          className="mb-5 h-[200px] overflow-clip rounded-xl"
        />
      </button>
    </div>
  );
}

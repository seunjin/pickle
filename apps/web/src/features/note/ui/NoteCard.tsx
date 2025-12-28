"use client";

import type { NoteWithAsset } from "@pickle/contracts/src/note";
import { Icon } from "@pickle/icons";
import { cn } from "@pickle/ui/lib/utils";
import { useState } from "react";
import { AssetImage } from "./AssetImage";
import { NoteCardHeader } from "./card/NoteCardHeader";

interface NoteCardProps {
  note: NoteWithAsset;
}

export function NoteCard({ note }: NoteCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  return (
    <NoteCardContainer>
      {/* thumbnail */}
      <Thumbnail note={note} />
      {/* content */}
      <div className="grid min-w-0 grid-rows-[auto_1fr] px-5 pt-5 pb-4">
        <div className="min-w-0 pb-3">
          <NoteCardHeader type={note.type} />

          <div className="ellipsis line-clamp-2 pb-2 font-semibold text-base text-neutral-100 leading-[1.3]">
            {note.title || "Untitled"}
          </div>
          <a
            href={note.meta?.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[13px] text-neutral-650 underline-offset-3 transition-[color,underline] hover:text-neutral-600 hover:underline"
          >
            <p className="truncate"> {note.meta?.url}</p>
          </a>
        </div>

        {/* footer */}
        <div className="mt-auto flex items-center justify-between gap-2">
          {/* 날짜 */}
          <span className="text-[13px] text-neutral-500 leading-[1]">
            {new Date(note.created_at).toLocaleDateString("ko-KR")}
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              className="group flex size-[26px] items-center justify-center rounded-sm transition-colors hover:bg-neutral-600/5"
            >
              <Icon
                name="ellipsis"
                size={16}
                className="transition-colors group-hover:text-neutral-300"
              />
            </button>
            <button
              type="button"
              className="group flex size-[26px] items-center justify-center rounded-sm transition-colors hover:bg-neutral-600/5"
              onClick={() => {
                setIsBookmarked(!isBookmarked);
              }}
            >
              <Icon
                name="bookmark"
                size={16}
                className={cn(
                  "transition-colors group-hover:text-neutral-300",
                  isBookmarked &&
                    "text-base-primary group-hover:text-base-primary",
                )}
              />
            </button>
          </div>
        </div>
      </div>
    </NoteCardContainer>
  );
}

function NoteCardContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid cursor-pointer grid-rows-[140px_1fr] overflow-hidden rounded-[16px] border border-base-border bg-neutral-900 text-tag">
      {children}
    </div>
  );
}

const Thumbnail = ({ note }: { note: NoteWithAsset }) => {
  switch (note.type) {
    case "text":
      return (
        <div className="overflow-hidden px-5 pt-4">
          <p className="line-clamp-6 font-medium text-[13px] text-neutral-300 leading-normal">
            {note.data.text}
          </p>
        </div>
      );
    case "bookmark":
      return note.type === "bookmark" && note.meta?.image ? (
        <img
          src={note.meta.image}
          alt={note.meta?.description}
          className={cn("h-full w-full object-cover")}
        />
      ) : (
        <ThumbnailNoImage />
      );
    case "image":
      return (
        <div className="relative aspect-video w-full overflow-hidden">
          {note.assets ? (
            <AssetImage path={note.assets?.full_path} alt={""} />
          ) : (
            <ThumbnailNoImage />
          )}
        </div>
      );
    case "capture":
      return (
        <div className="relative aspect-video w-full overflow-hidden">
          {note.assets ? (
            <AssetImage path={note.assets?.full_path} alt={""} />
          ) : (
            <ThumbnailNoImage />
          )}
        </div>
      );

    default:
      return null;
  }
};

const ThumbnailNoImage = () => {
  return (
    <div className="flex w-full select-none items-center justify-center bg-base-muted text-center font-semibold text-base text-neutral-600">
      No Image
    </div>
  );
};

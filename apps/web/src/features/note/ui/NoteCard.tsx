"use client";

import type { NoteWithAsset } from "@pickle/contracts/src/note";
import { Icon } from "@pickle/icons";
import { useDialog } from "@pickle/lib";
import { cn } from "@pickle/ui/lib/utils";
import { useState } from "react";
import NoteDetailDrawer from "@/features/layout/note-detail/NoteDetailDrawer";
import { NoteCardHeader } from "./card/NoteCardHeader";
import { Thumbnail } from "./thumbnail/Thumbnail";

interface NoteCardProps {
  note: NoteWithAsset;
}

export function NoteCard({ note }: NoteCardProps) {
  const dialog = useDialog();
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleCardClick = () => {
    dialog.open(() => <NoteDetailDrawer note={note} />);
  };

  return (
    <NoteCardContainer onClick={handleCardClick}>
      {/* thumbnail */}
      {note.type === "text" ? (
        // 텍스트 노트의 경우
        <div className="overflow-hidden px-5 pt-4">
          <p className="line-clamp-6 font-medium text-[13px] text-neutral-300 leading-normal">
            {note.data.text}
          </p>
        </div>
      ) : (
        <Thumbnail note={note} />
      )}

      {/* content */}
      <div className="grid min-w-0 grid-rows-[auto_1fr] px-5 pt-5 pb-4">
        <div className="min-w-0 pb-3">
          <NoteCardHeader type={note.type} />

          <div className="ellipsis line-clamp-2 pb-2 font-semibold text-[15px] text-neutral-100 leading-[1.3]">
            {note.title || "Untitled"}
          </div>
          <a
            href={note.meta?.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[13px] text-neutral-650 underline-offset-3 transition-[color,underline] hover:text-neutral-600 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="truncate"> {note.meta?.url}</p>
          </a>
        </div>

        {/* footer */}
        <div className="mt-auto flex items-center justify-between gap-2">
          {/* 날짜 */}
          <span className="text-[13px] text-neutral-500 leading-none">
            {new Date(note.created_at).toLocaleDateString("ko-KR")}
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              className="group flex size-[26px] items-center justify-center rounded-sm transition-colors hover:bg-neutral-600/5"
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Open menu
              }}
            >
              <Icon
                name="ellipsis"
                size={16}
                className="transition-colors group-hover:text-neutral-300"
              />
            </button>
            {/* 북마크 버튼 */}
            <button
              type="button"
              className="group flex size-[26px] items-center justify-center rounded-sm transition-colors hover:bg-neutral-600/5"
              onClick={(e) => {
                e.stopPropagation();
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

function NoteCardContainer({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onClick?.();
        }
      }}
      className="grid cursor-pointer grid-rows-[140px_1fr] overflow-hidden rounded-[16px] border border-base-border bg-neutral-900 text-tag"
    >
      {children}
    </div>
  );
}

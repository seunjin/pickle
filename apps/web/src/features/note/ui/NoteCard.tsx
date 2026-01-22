"use client";

import type { NoteWithAsset } from "@pickle/contracts/src/note";
import { useDialog } from "@pickle/ui";
import { cn } from "@pickle/ui/lib/utils";
import { NoteDetailDrawer } from "@/features/layout/note-detail/NoteDetailDrawer";
import { NoteCardHeader } from "./card/NoteCardHeader";
import { OverflowTagGroup } from "./OverflowTagGroup";
import { Thumbnail } from "./thumbnail/Thumbnail";

interface NoteCardProps {
  note: NoteWithAsset;
  readOnly?: boolean;
}

export function NoteCard({ note, readOnly }: NoteCardProps) {
  const dialog = useDialog();

  const handleCardClick = () => {
    dialog.open(() => <NoteDetailDrawer note={note} readOnly={readOnly} />);
  };

  return (
    <NoteCardContainer onClick={handleCardClick}>
      {/* thumbnail */}
      {note.type === "text" ? (
        // 텍스트 노트의 경우
        <div className="overflow-hidden px-4 pt-3 pb-4">
          <p className="line-clamp-6 font-medium text-[13px] text-neutral-300 leading-normal">
            {note.data.text}
          </p>
        </div>
      ) : (
        <Thumbnail note={note} />
      )}

      {/* content */}
      <div className="grid min-w-0 grid-rows-[auto_1fr] px-4 pt-3 pb-4">
        <div className="min-w-0 pb-[14px]">
          <NoteCardHeader note={note} type={note.type} />

          <div
            className={cn(
              "ellipsis mb-1 line-clamp-1 font-semibold text-[15px] text-neutral-100 leading-[1.3]",
            )}
          >
            {note.title}
          </div>

          <p
            className={cn(
              "truncate text-[13px] text-neutral-650 leading-[1.1]",
            )}
          >
            {note.meta?.url}
          </p>
        </div>

        {/* footer */}
        <div className="mt-auto flex items-center">
          <OverflowTagGroup tags={note.tag_list || []} />
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
      className={cn(
        "group/note-card grid cursor-pointer grid-rows-[140px_1fr] overflow-hidden rounded-[16px] border border-base-border bg-neutral-900 text-tag",
      )}
    >
      {children}
    </div>
  );
}

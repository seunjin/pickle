"use client";

import type { NoteWithAsset } from "@pickle/contracts/src/note";
import { Icon } from "@pickle/icons";
import {
  ActionButton,
  Confirm,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  useDialog,
} from "@pickle/ui";
import { useState } from "react";
import NoteDetailDrawer from "@/features/layout/note-detail/NoteDetailDrawer";
import { formatDate } from "@/shared/lib/date";
import { useDeleteNoteMutation } from "../model/useDeleteNoteMutation";
import { usePermanentlyDeleteNoteMutation } from "../model/usePermanentlyDeleteNoteMutation";
import { useRestoreNoteMutation } from "../model/useRestoreNoteMutation";
import { useUpdateNoteMutation } from "../model/useUpdateNoteMutation";
import { NoteCardHeader } from "./card/NoteCardHeader";
import { Thumbnail } from "./thumbnail/Thumbnail";

interface NoteCardProps {
  note: NoteWithAsset;
  readonly?: boolean;
}

export function NoteCard({ note, readonly }: NoteCardProps) {
  const dialog = useDialog();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { mutate: updateNote } = useUpdateNoteMutation();
  const { mutate: deleteNote } = useDeleteNoteMutation();
  const { mutate: restoreNote } = useRestoreNoteMutation();
  const { mutate: permanentlyDeleteNote } = usePermanentlyDeleteNoteMutation();

  const isBookmarked = !!note.bookmarked_at;

  const handleCardClick = () => {
    dialog.open(() => <NoteDetailDrawer note={note} />);
  };

  const handleBookmarkToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newBookmarkedAt = isBookmarked ? null : new Date().toISOString();

    updateNote({
      noteId: note.id,
      payload: { bookmarked_at: newBookmarkedAt },
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNote(note.id);
    setIsMenuOpen(false);
  };

  const handleRestore = (e: React.MouseEvent) => {
    e.stopPropagation();
    restoreNote(note.id);
    setIsMenuOpen(false);
  };

  const handlePermanentDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    dialog.open(() => (
      <Confirm
        title="영구 삭제"
        content="이 노트는 복구할 수 없습니다. 정말 영구 삭제하시겠습니까?"
        onConfirm={() => {
          permanentlyDeleteNote(note.id);
          setIsMenuOpen(false);
        }}
      />
    ));
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

          <div className="ellipsis line-clamp-2 pb-1 font-semibold text-[15px] text-neutral-100 leading-[1.3]">
            {note.title || "Untitled"}
          </div>

          <p className="truncate text-[13px] text-neutral-650">
            {note.meta?.url}
          </p>
        </div>

        {/* footer */}
        <div className="mt-auto flex items-center justify-between gap-2">
          {/* 날짜 */}
          <span className="text-[13px] text-neutral-500 leading-none">
            {formatDate(note.created_at)}
          </span>
          <div className="flex gap-1">
            {/* 메뉴 버튼 */}
            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <DropdownMenuTrigger asChild>
                <ActionButton
                  icon={"ellipsis_16"}
                  variant="action"
                  forceFocus={isMenuOpen}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="bottom" sideOffset={5}>
                {readonly ? (
                  <DropdownMenuItem asChild>
                    <button
                      type="button"
                      className="w-full cursor-pointer"
                      onClick={handleRestore}
                    >
                      <Icon name="refresh_16" /> 복원하기
                    </button>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem asChild>
                    <button
                      type="button"
                      className="w-full cursor-pointer"
                      onClick={handleDelete}
                    >
                      <Icon name="trash_16" /> 휴지통으로 이동
                    </button>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            {/* 북마크 버튼 */}
            <ActionButton
              icon={"bookmark_16"}
              variant="action"
              disabled={readonly}
              className={
                isBookmarked ? "text-base-primary hover:text-base-primary" : ""
              }
              onClick={handleBookmarkToggle}
            />
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

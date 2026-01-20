import type { NoteWithAsset } from "@pickle/contracts/src/note";
import { Icon } from "@pickle/icons";
import {
  ActionButton,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@pickle/ui";
import { useState } from "react";
import { BookmarkButton } from "@/features/layout/ui/BookmarkButton";
import { useDeleteNoteMutation } from "../../model/useDeleteNoteMutation";
import { useRestoreNoteMutation } from "../../model/useRestoreNoteMutation";
import { TypeLabel } from "../TypeLabel";

interface NoteCardHeaderProps {
  type: NoteWithAsset["type"];
  note: NoteWithAsset;
  readOnly?: boolean;
}

export function NoteCardHeader({ type, note, readOnly }: NoteCardHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const { mutate: deleteNote } = useDeleteNoteMutation();
  const { mutate: restoreNote } = useRestoreNoteMutation();

  const isBookmarked = !!note.bookmarked_at;

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
  return (
    <div className="mb-1.5 flex w-full items-center">
      <div className="flex w-full items-center justify-between">
        <TypeLabel type={type} />
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
              {readOnly ? (
                <>
                  <DropdownMenuItem asChild>
                    <button
                      type="button"
                      className="w-full cursor-pointer"
                      onClick={handleRestore}
                    >
                      <Icon name="refresh_16" /> 복구하기
                    </button>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <button
                      type="button"
                      className="w-full cursor-pointer"
                      onClick={handleRestore}
                    >
                      <Icon name="trash_16" /> 영구 삭제
                    </button>
                  </DropdownMenuItem>
                </>
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
          {!readOnly && (
            <BookmarkButton
              noteId={note.id}
              active={isBookmarked}
              readonly={readOnly}
            />
          )}
        </div>
      </div>
    </div>
  );
}

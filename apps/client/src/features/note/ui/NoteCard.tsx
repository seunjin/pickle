import { useDraggable } from "@dnd-kit/core";
import type { NoteWithAsset } from "@pickle/contracts/src/note";
import { useDialog } from "@pickle/ui";
import { cn } from "@pickle/ui/lib/utils";
import { useLocation, useSearch } from "@tanstack/react-router";
import { forwardRef } from "react";
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
  const search = useSearch({ strict: false }) as any;
  const { pathname } = useLocation();

  // 특정 '장소(Inbox, Folder)'가 아닌 '필터/상태' 기반 페이지에서는 드래그를 비활성화합니다.
  const isDragDisabled =
    !!search.tagId ||
    pathname.includes("/bookmarks") ||
    pathname.includes("/trash");

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: note.id,
    disabled: isDragDisabled,
    data: { note }, // ড্র래그 시 DragOverlay에서 사용할 타이틀 등을 위해 원본 전달
  });

  const style = {
    // OS에서 파일을 옮기듯 원본 위치는 고정하고 불투명도만 적용합니다.
    // transform 속성을 제거하여 원본 카드가 마우스를 따라 이동하지 않게 수정했습니다.
    opacity: isDragging ? 0.4 : undefined,
  };

  const handleCardClick = () => {
    dialog.open(() => <NoteDetailDrawer note={note} readOnly={readOnly} />);
  };

  return (
    <NoteCardContainer
      ref={setNodeRef}
      style={style}
      attributes={attributes}
      listeners={listeners}
      onClick={handleCardClick}
      draggable={!isDragDisabled}
      className={cn(isDragDisabled && "select-none")}
    >
      {/* thumbnail */}
      {note.type === "text" ? (
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
          <NoteCardHeader note={note} type={note.type} readOnly={readOnly} />

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

const NoteCardContainer = forwardRef<
  HTMLDivElement,
  {
    children: React.ReactNode;
    onClick?: () => void;
    style?: React.CSSProperties;
    attributes?: any;
    listeners?: any;
    draggable?: boolean;
    className?: string;
  }
>((props, ref) => {
  const {
    children,
    onClick,
    style,
    attributes,
    listeners,
    draggable,
    className,
  } = props;
  return (
    <div
      ref={ref}
      onClick={onClick}
      role="button"
      tabIndex={0}
      style={style}
      {...attributes}
      {...listeners}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onClick?.();
        }
      }}
      className={cn(
        "group/note-card grid cursor-pointer grid-rows-[140px_1fr] overflow-hidden rounded-[16px] border border-base-border bg-neutral-900 text-tag transition-all",
        className,
      )}
      draggable={draggable}
    >
      {children}
    </div>
  );
});

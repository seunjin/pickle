import type { NoteWithAsset } from "@pickle/contracts";
import { Icon } from "@pickle/icons";
import { useToast } from "@pickle/ui";
import { cn } from "@pickle/ui/lib/utils";
import { useEffect, useState } from "react";
import { useUpdateNoteMutation } from "@/features/note/model/useUpdateNoteMutation";
import { useDebouncedCallback } from "@/shared/hooks/useDebouncedCallback";
import { logger } from "@/shared/lib/logger";

interface BookmarkButtonProps {
  noteId: NoteWithAsset["id"];
  active?: boolean;
  readonly?: boolean;
}

export function BookmarkButton({
  noteId,
  active,
  readonly,
}: BookmarkButtonProps) {
  const { mutate: updateNote } = useUpdateNoteMutation();
  const toast = useToast();

  const [internalActive, setInternalActive] = useState(active);

  useEffect(() => {
    setInternalActive(active);
  }, [active]);

  const debouncedUpdate = useDebouncedCallback((newStatus: boolean) => {
    updateNote(
      {
        noteId,
        payload: { bookmarked_at: newStatus ? new Date().toISOString() : null },
      },
      {
        onError: (err) => {
          setInternalActive(!newStatus);
          toast.error({
            title: "북마크 상태 업데이트에 실패했습니다.",
          });
          logger.error("Bookmark update failed", { noteId, error: err });
        },
      },
    );
  }, 300);

  const handleBookmarkToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (readonly) return;

    const nextStatus = !internalActive;
    setInternalActive(nextStatus);
    debouncedUpdate(nextStatus);
  };

  return (
    <button
      type="button"
      className="group/bookmark inline-flex size-6.5 items-center justify-center rounded-sm hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-transparent"
      disabled={readonly}
      onClick={handleBookmarkToggle}
    >
      <Icon
        name="bookmark_16"
        className={cn(
          "transition-colors group-hover/bookmark:text-neutral-300 group-disabled/bookmark:text-base-disabled",
          internalActive
            ? "fill-white/40 text-neutral-300"
            : "text-neutral-500",
        )}
      />
    </button>
  );
}

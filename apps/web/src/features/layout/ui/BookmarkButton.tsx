"use client";
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

  // ✅ 즉각적인 피드백을 위한 로컬 상태
  // useOptimistic은 비동기 액션이 끝날 때까지만 유지되므로,
  // 디바운스 대기 시간(300ms) 동안 UI를 유지하기 위해 useState를 사용합니다.
  const [internalActive, setInternalActive] = useState(active);

  // 서버 데이터(props)와 로컬 상태 동기화
  useEffect(() => {
    setInternalActive(active);
  }, [active]);

  // ✅ 서버 요청 디바운싱 (300ms)
  const debouncedUpdate = useDebouncedCallback((newStatus: boolean) => {
    updateNote(
      {
        noteId,
        payload: { bookmarked_at: newStatus ? new Date().toISOString() : null },
      },
      {
        onError: (err) => {
          // 에러 발생 시 로컬 상태도 원복 (React Query 롤백과 동기화)
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

    // 1. UI 즉시 반영 (0ms)
    setInternalActive(nextStatus);

    // 2. 서버 통신은 디바운스 처리
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

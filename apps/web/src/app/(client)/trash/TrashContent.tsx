"use client";

import { Spinner, UtilButton } from "@pickle/ui";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSessionContext } from "@/features/auth";
import { NoteList } from "@/features/note";
import { noteQueries } from "@/features/note/model/noteQueries";
import EmptyTrashButton from "@/features/note/ui/EmptyTrashButton";

export function TrashContent() {
  const { workspace } = useSessionContext();
  const [sort, setSort] = useState<"latest" | "oldest">("latest");
  const observerTarget = useRef<HTMLDivElement>(null);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      ...noteQueries.trashInfinite(
        {
          workspaceId: workspace?.id,
          sort,
        },
        20,
      ),
      enabled: !!workspace?.id,
    });

  const trashNotes = useMemo(
    () => data?.pages.flatMap((page) => page.notes) || [],
    [data],
  );

  const totalCount = data?.pages[0]?.totalCount || 0;

  // 무한 스크롤 관찰자 설정
  useEffect(() => {
    if (!observerTarget.current || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="h-full">
      {trashNotes.length > 0 && (
        <div className="flex items-center justify-between pb-7.5">
          <EmptyTrashButton />
          <div className="flex items-center gap-3">
            <span className="font-medium text-[14px] text-base-muted">
              총 {totalCount}개
            </span>
            <UtilButton
              icon="sort_16"
              variant="secondary_line"
              onClick={() => setSort(sort === "latest" ? "oldest" : "latest")}
            >
              {sort === "latest" ? "최신순" : "오래된순"}
            </UtilButton>
          </div>
        </div>
      )}

      <div className="relative">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16">
            <Spinner className="size-8 text-base-primary" />
            <span className="text-[14px] text-base-muted">
              휴지통을 불러오는 중...
            </span>
          </div>
        ) : (
          <>
            <NoteList notes={trashNotes} readOnly nodataType="trash" />
            <div ref={observerTarget} className="mb-10 h-10 w-full">
              {isFetchingNextPage && (
                <div className="flex items-center justify-center py-4">
                  <Spinner className="size-6 text-base-primary" />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

"use client";
import type { NoteWithAsset } from "@pickle/contracts/src/note";
import { type SelectOptionValue, Spinner } from "@pickle/ui";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import type { NodataType } from "@/app/(client)/NoteNodata";
import { useSessionContext } from "@/features/auth/model/SessionContext";
import { noteQueries } from "../model/noteQueries";
import { useSyncNoteList } from "../model/useSyncNoteList";
import { NoteList } from "./NoteList";
import { NoteListFilter } from "./NoteListFilter";

interface NoteListWithFilterProps {
  onlyBookmarked?: boolean;
  folderId?: string | null;
  tagId?: string | null;
  nodataType?: NodataType;
}

export function NoteListWithFilter({
  onlyBookmarked = false,
  folderId,
  tagId,
  nodataType,
}: NoteListWithFilterProps) {
  const { workspace } = useSessionContext();
  const workspaceId = workspace?.id;
  const observerTarget = useRef<HTMLDivElement>(null);
  const [selectedType, setSelectedType] = useState<SelectOptionValue>("all");
  const [sort, setSort] = useState<"latest" | "oldest">("latest");

  // 실시간 동기화 구독 시작 (BroadcastChannel)
  useSyncNoteList();

  // 1. Fetch Infinite Data
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      ...noteQueries.listInfinite(
        {
          workspaceId,
          filter: {
            onlyBookmarked,
            folderId,
            tagId: tagId || undefined,
            type:
              selectedType === "all"
                ? undefined
                : (selectedType as NoteWithAsset["type"]),
          },
          sort,
        },
        20,
      ),
      enabled: !!workspaceId,
    });

  const notes = useMemo(
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
    <div className="grid h-full grid-rows-[auto_1fr]">
      <NoteListFilter
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        sort={sort}
        onSortChange={setSort}
        totalCount={totalCount}
        filteredCount={notes.length} // 현재 로드된 개수 표시
      />

      <div className="relative">
        {isLoading ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 py-16">
            <Spinner className="size-8 text-base-primary" />
            <span className="text-[14px] text-base-muted">
              노트를 불러오는 중...
            </span>
          </div>
        ) : (
          <>
            <NoteList notes={notes} nodataType={nodataType} />
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

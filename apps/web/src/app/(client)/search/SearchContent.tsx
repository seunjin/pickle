"use client";
import { type SelectOptionValue, Spinner } from "@pickle/ui";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useSessionContext } from "@/features/auth";
import { noteQueries } from "@/features/note/model/noteQueries";
import { NoteList } from "@/features/note/ui/NoteList";
import { SearchNoteFilter } from "@/features/note/ui/SearchNoteFilter";

export function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { workspace } = useSessionContext();
  const observerTarget = useRef<HTMLDivElement>(null);

  // URL 파라미터에서 상태 추출
  const query = searchParams.get("q") || "";
  const selectedType = (searchParams.get("type") as SelectOptionValue) || "all";
  const selectedFolderId =
    (searchParams.get("folderId") as SelectOptionValue) || "all";
  const selectedTagIds = useMemo(() => {
    const tags = searchParams.get("tagIds");
    return tags ? tags.split(",") : [];
  }, [searchParams]);
  const sort = (searchParams.get("sort") as "latest" | "oldest") || "latest";

  // URL 업데이트 유틸리티
  const updateUrl = useCallback(
    (updates: Record<string, string | string[] | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (
          value === undefined ||
          value === "all" ||
          (Array.isArray(value) && value.length === 0)
        ) {
          params.delete(key);
        } else if (Array.isArray(value)) {
          params.set(key, value.join(","));
        } else {
          params.set(key, value);
        }
      }

      router.push(`/search?${params.toString()}`);
    },
    [searchParams, router],
  );

  // 검색 결과 조회 (무한 스크롤)
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      ...noteQueries.searchInfinite({
        workspaceId: workspace?.id,
        query: query,
        filter: {
          type: selectedType === "all" ? undefined : (selectedType as any),
          folderId:
            selectedFolderId === "all"
              ? undefined
              : selectedFolderId === "inbox"
                ? "inbox"
                : (selectedFolderId as string),
          tagIds: selectedTagIds,
        },
        sort,
      }),
      enabled: !!workspace?.id,
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
    <div className="flex h-full flex-col">
      <SearchNoteFilter
        selectedType={selectedType}
        onTypeChange={(val) => updateUrl({ type: val as string })}
        selectedFolderId={selectedFolderId}
        onFolderChange={(val) => updateUrl({ folderId: val as string })}
        selectedTagIds={selectedTagIds}
        onTagsChange={(tags) => updateUrl({ tagIds: tags })}
        sort={sort}
        onSortChange={(val) => updateUrl({ sort: val })}
        totalCount={totalCount}
        query={query}
      />

      <div className="relative flex-1">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-base-background/50">
            <Spinner className="size-8 text-base-primary" />
            <span className="text-[14px] text-base-primary">검색중...</span>
          </div>
        ) : (
          <>
            <NoteList notes={notes} nodataType="search" />
            <div ref={observerTarget} className="h-10 w-full">
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

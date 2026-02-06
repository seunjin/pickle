import type { NoteWithAsset } from "@pickle/contracts/src/note";
import { type SelectOptionValue, Spinner } from "@pickle/ui";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useSessionContext } from "@/features/auth/model/SessionContext";
import { noteQueries } from "@/features/note/model/noteQueries";
import { NoteList } from "@/features/note/ui/NoteList";
import { SearchNoteFilter } from "@/features/note/ui/SearchNoteFilter";

const NOTE_TYPES = ["text", "image", "capture", "bookmark"] as const;
type NoteType = NoteWithAsset["type"];

function isValidNoteType(value: string): value is NoteType {
  return NOTE_TYPES.includes(value as NoteType);
}

export function SearchContent() {
  const navigate = useNavigate();
  const searchParams = useSearch({ strict: false }) as any;
  const { workspace } = useSessionContext();
  const observerTarget = useRef<HTMLDivElement>(null);

  const query = searchParams.q || "";
  const selectedType = (searchParams.type as SelectOptionValue) || "all";
  const selectedFolderId =
    (searchParams.folderId as SelectOptionValue) || "all";
  const selectedTagIds = useMemo(() => {
    const tags = searchParams.tagIds;
    return tags ? tags.split(",") : [];
  }, [searchParams.tagIds]);
  const sort = (searchParams.sort as "latest" | "oldest") || "latest";

  const updateUrl = useCallback(
    (updates: Record<string, string | string[] | undefined>) => {
      navigate({
        to: "/search",
        search: (prev: any) => {
          const next = { ...prev, ...updates };
          for (const key in next) {
            if (
              next[key] === undefined ||
              next[key] === "all" ||
              (Array.isArray(next[key]) && next[key].length === 0)
            ) {
              delete next[key];
            } else if (Array.isArray(next[key])) {
              next[key] = next[key].join(",");
            }
          }
          return next;
        },
      });
    },
    [navigate],
  );

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      ...noteQueries.searchInfinite({
        workspaceId: workspace?.id,
        query: query,
        filter: {
          type:
            selectedType === "all"
              ? undefined
              : isValidNoteType(selectedType as string)
                ? (selectedType as NoteType)
                : undefined,
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

      <div className="relative">
        {isLoading ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 pb-[calc(var(--web-header-height)*3)]">
            <Spinner className="size-8 text-base-primary" />
            <span className="text-[14px] text-base-primary">검색중...</span>
          </div>
        ) : (
          <>
            <NoteList notes={notes} nodataType="search" />
            <div ref={observerTarget} className="h-10 w-full pb-20">
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

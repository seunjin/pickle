"use client";
import { type SelectOptionValue, Spinner } from "@pickle/ui";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useSessionContext } from "@/features/auth";
import { noteQueries } from "@/features/note/model/noteQueries";
import { NoteList } from "@/features/note/ui/NoteList";
import { SearchNoteFilter } from "@/features/note/ui/SearchNoteFilter";

export function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const { workspace } = useSessionContext();

  const [selectedType, setSelectedType] = useState<SelectOptionValue>("all");
  const [selectedFolderId, setSelectedFolderId] =
    useState<SelectOptionValue>("all");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [sort, setSort] = useState<"latest" | "oldest">("latest");

  // 검색 결과 조회
  const { data: notes = [], isLoading } = useQuery({
    ...noteQueries.search({
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

  return (
    <div className="flex h-full flex-col">
      <SearchNoteFilter
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        selectedFolderId={selectedFolderId}
        onFolderChange={setSelectedFolderId}
        selectedTagIds={selectedTagIds}
        onTagsChange={setSelectedTagIds}
        sort={sort}
        onSortChange={setSort}
        totalCount={notes.length}
        query={query}
      />

      <div className="relative flex-1">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-base-background/50">
            <Spinner className="size-8 text-base-primary" />
            <span className="text-[14px] text-base-primary">검색중...</span>
          </div>
        ) : (
          <NoteList notes={notes} nodataType="search" />
        )}
      </div>
    </div>
  );
}

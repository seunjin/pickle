"use client";

import { useState } from "react";
import { SearchNoteFilter } from "@/features/note/ui/SearchNoteFilter";

export function SearchContent() {
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedFolderId, setSelectedFolderId] = useState<string>("all");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [sort, setSort] = useState<"latest" | "oldest">("latest");

  return (
    <div className="h-full">
      <SearchNoteFilter
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        selectedFolderId={selectedFolderId}
        onFolderChange={setSelectedFolderId}
        selectedTagIds={selectedTagIds}
        onTagsChange={setSelectedTagIds}
        sort={sort}
        onSortChange={setSort}
        totalCount={0} // TODO: 실제 검색 결과 개수 연동
      />

      <div className="py-10 text-center text-base-muted">
        검색 결과가 여기에 표시됩니다.
      </div>
    </div>
  );
}

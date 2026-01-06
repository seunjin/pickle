"use client";

import type { NoteWithAsset } from "@pickle/contracts/src/note";
import type { SelectOptionValue } from "@pickle/ui";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { noteQueries } from "../model/noteQueries";
import { NoteList } from "./NoteList";
import { NoteListFilter } from "./NoteListFilter";

interface NoteListWithFilterProps {
  onlyBookmarked?: boolean;
}

export function NoteListWithFilter({
  onlyBookmarked = false,
}: NoteListWithFilterProps) {
  const [selectedType, setSelectedType] = useState<SelectOptionValue>("all");

  const filter = {
    onlyBookmarked,
    type:
      selectedType === "all"
        ? undefined
        : (selectedType as NoteWithAsset["type"]),
  };

  // 1. Fetch Data (Client Side for counting and filtering)
  // Suspense를 사용하면 부모에서 data에 접근하기 어려우므로 useQuery 사용
  const { data: notes = [] } = useQuery(noteQueries.list({ filter }));

  return (
    <div className="flex flex-col gap-6">
      <NoteListFilter
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        totalCount={notes.length}
      />
      <NoteList onlyBookmarked={onlyBookmarked} type={filter.type} />
    </div>
  );
}

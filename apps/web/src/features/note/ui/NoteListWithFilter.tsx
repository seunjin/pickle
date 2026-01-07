"use client";

import type { NoteWithAsset } from "@pickle/contracts/src/note";
import type { SelectOptionValue } from "@pickle/ui";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { createClient } from "@/shared/lib/supabase/client";
import { noteQueries } from "../model/noteQueries";
import { useSyncNoteList } from "../model/useSyncNoteList";
import { NoteList } from "./NoteList";
import { NoteListFilter } from "./NoteListFilter";

interface NoteListWithFilterProps {
  onlyBookmarked?: boolean;
  folderId?: string | null;
  tagId?: string | null; // ✅ 태그 필터 추가
}

export function NoteListWithFilter({
  onlyBookmarked = false,
  folderId,
  tagId,
}: NoteListWithFilterProps) {
  const client = createClient();
  const [selectedType, setSelectedType] = useState<SelectOptionValue>("all");

  // 실시간 동기화 구독 시작 (BroadcastChannel)
  useSyncNoteList();

  // 1. Fetch "Context All" Data (Suspense)
  // 현재 폴더/태그 상태의 모든 노트를 가져옴 (타입 필터 제외)
  const { data: allNotes = [] } = useSuspenseQuery(
    noteQueries.list({
      client,
      filter: {
        onlyBookmarked,
        folderId,
        tagId: tagId || undefined,
      },
    }),
  );

  // 2. Client-side Filtering (Type filter only)
  const filteredNotes =
    selectedType === "all"
      ? allNotes
      : allNotes.filter((note: NoteWithAsset) => note.type === selectedType);

  return (
    <div className="flex flex-col">
      <NoteListFilter
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        totalCount={allNotes.length}
        filteredCount={filteredNotes.length}
      />
      <NoteList
        notes={filteredNotes}
        emptyIcon={onlyBookmarked ? "⭐️" : "📝"}
        emptyMessage={
          onlyBookmarked ? "북마크된 노트가 없습니다" : "아직 노트가 없습니다"
        }
        emptyDescription={
          onlyBookmarked
            ? "중요한 노트를 북마크해 보세요!"
            : "익스텐션에서 노트를 생성해 보세요!"
        }
      />
    </div>
  );
}

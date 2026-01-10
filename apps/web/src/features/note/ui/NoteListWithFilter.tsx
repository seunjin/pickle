"use client";

import type { NoteWithAsset } from "@pickle/contracts/src/note";
import type { SelectOptionValue } from "@pickle/ui";
import { useQuery } from "@tanstack/react-query";
import { div } from "motion/react-client";
import { useState } from "react";
import type { NodataType } from "@/app/(client)/NoteNodata";
import { useSessionContext } from "@/features/auth";
import { createClient } from "@/shared/lib/supabase/client";
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
  const client = createClient();
  const { workspace } = useSessionContext();
  const workspaceId = workspace?.id;
  const [selectedType, setSelectedType] = useState<SelectOptionValue>("all");

  // 실시간 동기화 구독 시작 (BroadcastChannel)
  useSyncNoteList();

  // 1. Fetch "Context All" Data (workspace 로드 후에만 실행)
  const { data: allNotes = [] } = useQuery({
    ...noteQueries.list({
      client,
      workspaceId,
      filter: {
        onlyBookmarked,
        folderId,
        tagId: tagId || undefined,
      },
    }),
    enabled: !!workspaceId,
  });

  // 2. Client-side Filtering (Type filter only)
  const filteredNotes =
    selectedType === "all"
      ? allNotes
      : allNotes.filter((note: NoteWithAsset) => {
          if (selectedType === "image") {
            return note.type === "image" || note.type === "capture";
          }
          return note.type === selectedType;
        });

  return (
    <>
      {allNotes.length > 0 && (
        <NoteListFilter
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          totalCount={allNotes.length}
          filteredCount={filteredNotes.length}
        />
      )}

      <NoteList notes={filteredNotes} nodataType={nodataType} />
    </>
  );
}

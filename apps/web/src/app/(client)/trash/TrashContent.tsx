"use client";

import { UtilButton } from "@pickle/ui";
import { useQuery } from "@tanstack/react-query";
import { Suspense, useState } from "react";
import { useSessionContext } from "@/features/auth";
import { NoteList } from "@/features/note";
import { noteQueries } from "@/features/note/model/noteQueries";
import EmptyTrashButton from "@/features/note/ui/EmptyTrashButton";

export function TrashContent() {
  const { workspace } = useSessionContext();
  const [sort, setSort] = useState<"latest" | "oldest">("latest");
  const { data: trashNotes = [] } = useQuery(
    noteQueries.trash(undefined, workspace?.id),
  );

  return (
    <div className="h-full">
      {trashNotes.length > 0 && (
        <div className="flex items-center justify-between pb-7.5">
          <EmptyTrashButton />
          <div className="flex items-center gap-3">
            {/* 총 휴지토 노트 수*/}
            <span className="font-medium text-[14px] text-base-muted">
              총 {trashNotes.length}개
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

      <Suspense
        fallback={
          <div className="flex items-center justify-center py-16 text-base-muted">
            Loading notes...
          </div>
        }
      >
        <NoteList notes={trashNotes} readOnly nodataType="trash" />
      </Suspense>
    </div>
  );
}

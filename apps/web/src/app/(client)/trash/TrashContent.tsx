"use client";

import { useQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { useSessionContext } from "@/features/auth";
import { NoteList } from "@/features/note";
import { noteQueries } from "@/features/note/model/noteQueries";
import EmptyTrashButton from "./EmptyTrashButton";

export function TrashContent() {
  const { workspace } = useSessionContext();
  const { data: trashNotes = [] } = useQuery(
    noteQueries.trash(undefined, workspace?.id),
  );

  return (
    <div className="h-full p-10">
      {trashNotes.length > 0 && (
        <div className="pb-7.5">
          <EmptyTrashButton />
        </div>
      )}

      <Suspense
        fallback={
          <div className="flex items-center justify-center py-16 text-base-muted">
            Loading notes...
          </div>
        }
      >
        <NoteList
          notes={trashNotes}
          readonly
          emptyMessage="휴지통이 비어 있습니다"
          emptyDescription="삭제된 노트가 여기에 표시됩니다."
        />
      </Suspense>
    </div>
  );
}

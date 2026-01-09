"use client";

import { useQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { useSessionContext } from "@/features/auth";
import { NoteList } from "@/features/note";
import { noteQueries } from "@/features/note/model/noteQueries";
import EmptyTrashButton from "@/features/note/ui/EmptyTrashButton";

export function TrashContent() {
  const { workspace } = useSessionContext();
  const { data: trashNotes = [] } = useQuery(
    noteQueries.trash(undefined, workspace?.id),
  );

  return (
    <div className="h-full">
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
        <NoteList notes={trashNotes} readonly nodataType="trash" />
      </Suspense>
    </div>
  );
}

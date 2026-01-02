"use client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { deleteNote as deleteNoteApi } from "../api/deleteNote";
import { noteKeys, noteQueries } from "../model/noteQueries";
import { NoteCard } from "./NoteCard";

export function NoteList() {
  const queryClient = useQueryClient();

  // 1. Fetch Data (Suspense)
  const { data: notes } = useSuspenseQuery(noteQueries.all());

  // 2. Mutation (Delete)
  const { mutate: deleteNote } = useMutation({
    mutationFn: (id: string) => deleteNoteApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.all });
    },
  });

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 text-4xl">📝</div>
        <p className="font-medium text-base-foreground">아직 노트가 없습니다</p>
        <p className="mt-1 text-base-muted text-sm">
          익스텐션에서 노트를 생성해 보세요!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fit,295px)] gap-4">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onDelete={(noteId) => deleteNote(noteId)}
        />
      ))}
    </div>
  );
}

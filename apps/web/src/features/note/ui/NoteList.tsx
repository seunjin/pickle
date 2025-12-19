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
      <div className="py-12 text-center text-gray-500">
        <p>No notes yet.</p>
        <p className="text-sm">Create a note from the extension!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} onDelete={deleteNote} />
      ))}
    </div>
  );
}

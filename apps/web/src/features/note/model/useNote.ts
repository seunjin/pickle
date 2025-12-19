import type { CreateNoteInput } from "@pickle/contracts/src/note";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createNote } from "../api/createNote";
import { deleteNote } from "../api/deleteNote";
import { getNotes } from "../api/getNotes";

export function useNote() {
  const queryClient = useQueryClient();

  // 1. Fetch Notes (GET)
  const {
    data: notes,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["notes"],
    queryFn: getNotes,
  });

  // 2. Create Note (POST)
  const { mutate: performCreateNote, isPending: isCreating } = useMutation({
    mutationFn: (newNote: CreateNoteInput) => createNote(newNote),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  // 3. Delete Note (DELETE)
  const { mutate: performDeleteNote, isPending: isDeleting } = useMutation({
    mutationFn: (noteId: string) => deleteNote(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  return {
    notes: notes ?? [],
    isLoading,
    isError: error,
    createNote: performCreateNote,
    isCreating,
    deleteNote: performDeleteNote,
    isDeleting,
  };
}

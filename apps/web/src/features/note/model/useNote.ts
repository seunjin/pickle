import type { CreateNoteInput, Note } from "@pickle/contracts/src/note";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Fetcher implementation
const fetchNotes = async (): Promise<{ notes: Note[] }> => {
  const res = await fetch("/api/internal/notes");
  if (!res.ok) {
    throw new Error("Failed to fetch notes");
  }
  return res.json();
};

// Mutation implementation
const createNoteRequest = async (newNote: CreateNoteInput) => {
  const res = await fetch("/api/internal/notes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newNote),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to create note");
  }

  return res.json();
};

export function useNote() {
  const queryClient = useQueryClient();

  // 1. Fetch Notes (GET)
  const { data, error, isLoading } = useQuery({
    queryKey: ["notes"],
    queryFn: fetchNotes,
  });

  // 2. Create Note (POST)
  const { mutate: createNote, isPending: isCreating } = useMutation({
    mutationFn: createNoteRequest,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  return {
    notes: data?.notes ?? [],
    isLoading,
    isError: error,
    createNote,
    isCreating,
  };
}

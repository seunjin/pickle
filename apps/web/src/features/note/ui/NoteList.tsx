"use client";
import type { NoteWithAsset } from "@pickle/contracts/src/note";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { deleteNote as deleteNoteApi } from "../api/deleteNote";
import { noteKeys, noteQueries } from "../model/noteQueries";
import { NoteCard } from "./NoteCard";

export function NoteList({
  onlyBookmarked = false,
}: {
  onlyBookmarked?: boolean;
}) {
  // 1. Fetch Data (Suspense)
  const queryOption = onlyBookmarked
    ? noteQueries.bookmarks()
    : noteQueries.all();
  const { data: notes } = useSuspenseQuery<NoteWithAsset[]>(queryOption as any);

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 text-4xl">{onlyBookmarked ? "⭐️" : "📝"}</div>
        <p className="font-medium text-base-foreground">
          {onlyBookmarked ? "북마크된 노트가 없습니다" : "아직 노트가 없습니다"}
        </p>
        <p className="mt-1 text-base-muted text-sm">
          {onlyBookmarked
            ? "중요한 노트를 북마크해 보세요!"
            : "익스텐션에서 노트를 생성해 보세요!"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fit,295px)] gap-4">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} />
      ))}
    </div>
  );
}

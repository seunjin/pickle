import type { NoteWithAsset } from "@pickle/contracts/src/note";
import { NoteCard } from "./NoteCard";

export function NoteList({
  notes,
  emptyMessage = "아직 노트가 없습니다",
  emptyDescription = "익스텐션에서 노트를 생성해 보세요!",
  emptyIcon = "📝",
}: {
  notes: NoteWithAsset[];
  emptyMessage?: string;
  emptyDescription?: string;
  emptyIcon?: string;
}) {
  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 text-4xl">{emptyIcon}</div>
        <p className="font-medium text-base-foreground">{emptyMessage}</p>
        <p className="mt-1 text-base-muted text-sm">{emptyDescription}</p>
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

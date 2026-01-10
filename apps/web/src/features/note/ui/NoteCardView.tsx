import { use } from "react";
import { NoteCard } from "./NoteCard";
import { NoteContext } from "./NoteContext";

export function NoteCardView() {
  const context = use(NoteContext);

  if (!context) {
    throw new Error("NoteCardView must be used within a NoteContext");
  }

  const { notes, readonly } = context;

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(295px,1fr))] gap-4 pb-20">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} readonly={readonly} />
      ))}
    </div>
  );
}

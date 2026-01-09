import type { NoteWithAsset } from "@pickle/contracts/src/note";
import { type NodataType, NoteNodata } from "@/app/(client)/NoteNodata";
import { NoteCard } from "./NoteCard";

export function NoteList({
  notes,
  nodataType = "default",
  readonly = false,
}: {
  notes: NoteWithAsset[];
  nodataType?: NodataType;
  readonly?: boolean;
}) {
  if (notes.length === 0) {
    return <NoteNodata type={nodataType} />;
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fit,295px)] gap-4">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} readonly={readonly} />
      ))}
    </div>
  );
}

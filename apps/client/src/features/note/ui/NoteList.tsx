import type { NoteWithAsset } from "@pickle/contracts/src/note";
import { NoteCardView } from "./NoteCardView";
import { NoteContext } from "./NoteContext";
import { type NodataType, NoteNodata } from "./NoteNodata";

export function NoteList({
  notes,
  nodataType = "default",
  readOnly = false,
}: {
  notes: NoteWithAsset[];
  nodataType?: NodataType;
  readOnly?: boolean;
}) {
  if (notes.length === 0) {
    return <NoteNodata type={nodataType} />;
  }

  return (
    <NoteContext value={{ notes, readOnly }}>
      <NoteCardView />
    </NoteContext>
  );
}

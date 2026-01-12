import type { NoteWithAsset } from "@pickle/contracts/src/note";
import { type NodataType, NoteNodata } from "@/app/(client)/NoteNodata";
import { NoteCardView } from "./NoteCardView";
import { NoteContext } from "./NoteContext";

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

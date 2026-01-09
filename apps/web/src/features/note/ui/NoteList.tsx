import type { NoteWithAsset } from "@pickle/contracts/src/note";
import { Activity } from "react";
import { type NodataType, NoteNodata } from "@/app/(client)/NoteNodata";
import { useViewStore } from "@/shared/stores/useViewStore";
import { NoteCardView } from "./NoteCardView";
import { NoteContext } from "./NoteContext";
import { NoteListView } from "./NoteListView";

export function NoteList({
  notes,
  nodataType = "default",
  readonly = false,
}: {
  notes: NoteWithAsset[];
  nodataType?: NodataType;
  readonly?: boolean;
}) {
  const { listForm } = useViewStore();

  if (notes.length === 0) {
    return <NoteNodata type={nodataType} />;
  }

  return (
    <NoteContext value={{ notes, readonly }}>
      <Activity mode={listForm === "list" ? "visible" : "hidden"}>
        <NoteListView />
      </Activity>
      <Activity mode={listForm === "card" ? "visible" : "hidden"}>
        <NoteCardView />
      </Activity>
    </NoteContext>
  );
}

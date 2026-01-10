import type { NoteWithAsset } from "@pickle/contracts/src/note";
import { Icon } from "@pickle/icons";
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
      {/* 
      <div className="sticky bottom-0 flex items-center justify-center gap-4 pb-(--web-header-height)">
        <div className="flex items-center justify-center gap-4 rounded-full border border-base-border-light bg-base-foreground-background/10 p-3 shadow-standard backdrop-blur-sm">
          <button
            type="button"
            className="inline-flex size-6.5 items-center justify-center rounded-full bg-base-background"
          >
            <Icon name="arrow_left_16" />
          </button>
          {[1, 2, 3, 4, 5].map((item) => (
            <button type="button" key={item}>
              {item}
            </button>
          ))}
          <button
            type="button"
            className="inline-flex size-6.5 items-center justify-center rounded-full bg-base-background"
          >
            <Icon name="arrow_right_16" />
          </button>
        </div>
      </div> */}
    </NoteContext>
  );
}

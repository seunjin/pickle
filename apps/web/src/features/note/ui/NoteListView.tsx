import type { NoteWithAsset } from "@pickle/contracts";
import { Icon } from "@pickle/icons";
import { ActionButton } from "@pickle/ui";
import { use } from "react";
import { formatDate } from "@/shared/lib/date";
import { NoteContext } from "./NoteContext";
import { TypeLabel } from "./TypeLabel";

export function NoteListView() {
  const context = use(NoteContext);

  if (!context) {
    throw new Error("NoteListView must be used within a NoteContext");
  }

  const { notes } = context;

  const thumbnailClassName =
    "w-20 aspect-video shrink-0 rounded-tl-md rounded-bl-md overflow-hidden border border-r-0 border-base-border-light";

  return (
    <ul className="flex flex-col gap-2 pb-20">
      {notes.map((note) => (
        <li key={note.id} className="flex">
          {/* <Thumbnail note={note} className={thumbnailClassName} /> */}
          {/* {note.type === "text" && <div className={thumbnailClassName} />} */}
          <div className="flex flex-1 gap-4 rounded-md border border-base-border-light bg-base-foreground-background px-3 py-2">
            <div className="flex w-full flex-col">
              <div className="grid grid-cols-[1fr_auto] items-center gap-2">
                <div className="grid grid-cols-[auto_1fr] items-center gap-2">
                  <div className="flex items-center gap-2">
                    <TypeLabel type={note.type} mode="default" />
                    <div className="h-3.5 w-px bg-base-border-light" />
                  </div>
                  <span className="truncate font-semibold text-[14px]">
                    {note.title}
                  </span>
                </div>
                <div className="flex gap-1">
                  <ActionButton icon="ellipsis_16" />
                  <button
                    type="button"
                    className="inline-flex size-6.5 items-center justify-center"
                  >
                    <Icon name="bookmark_16" />
                  </button>
                </div>
              </div>
              <div className="flex-1">
                <div className="grid grid-cols-[1fr_auto] items-center gap-2">
                  <p className="truncate text-[13px] text-neutral-650">
                    {note.url}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="h-3.5 w-px bg-base-border-light" />
                    <span className="text-[13px] text-neutral-500">
                      {formatDate(note.created_at, "date")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

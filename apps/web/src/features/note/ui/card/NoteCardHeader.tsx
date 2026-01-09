import type { NoteWithAsset } from "@pickle/contracts/src/note";
import { TypeLabel } from "../TypeLabel";

interface NoteCardHeaderProps {
  type: NoteWithAsset["type"];
}

export function NoteCardHeader({ type }: NoteCardHeaderProps) {
  return (
    <div className="mb-1.5 flex w-full items-center">
      <div className="flex w-full items-center">
        <TypeLabel type={type} />
      </div>
    </div>
  );
}

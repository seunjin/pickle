import type { NoteWithAsset } from "@pickle/contracts/src/note";
import type { HTMLAttributes } from "react";

interface NoteCardHeaderProps {
  type: NoteWithAsset["type"];
}

const TYPE_LABELS: Record<string, string> = {
  text: "TEXT",
  image: "IMAGE",
  capture: "CAPTURE",
  bookmark: "URL",
};

const type_per_class: Record<
  NoteWithAsset["type"],
  HTMLAttributes<"span">["className"]
> = {
  text: "font-medium text-[13px] text-blue-500 tracking-wider",
  image: "font-medium text-[13px] text-green-500 tracking-wider",
  capture: "font-medium text-[13px] text-green-500 tracking-wider",
  bookmark: "font-medium text-[13px] text-yellow-500 tracking-wider",
};

const type_per_icon: Record<
  NoteWithAsset["type"],
  HTMLAttributes<"span">["className"]
> = {
  text: "size-[14px] rounded-sm bg-blue-500/10",
  image: "size-[14px] rounded-sm bg-green-500/10",
  capture: "size-[14px] rounded-sm bg-green-500/10",
  bookmark: "size-[14px] rounded-sm bg-yellow-500/10",
};
export function NoteCardHeader({ type }: NoteCardHeaderProps) {
  return (
    <div className="mb-1.5 flex w-full items-center">
      <div className="flex w-full items-center">
        <div className="flex items-center gap-2">
          <div className={type_per_icon[type]}></div>
          <span className={type_per_class[type]}>
            {TYPE_LABELS[type] || type.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}

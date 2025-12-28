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

export function NoteCardHeader({ type }: NoteCardHeaderProps) {
  return (
    <div className="mb-1.5 flex w-full items-center">
      <div className="flex w-full items-center">
        <div className="flex items-center gap-1">
          <div>
            {type === "bookmark" && (
              <img src="/type-01.svg" alt="bookmark type icon" />
            )}
            {(type === "image" || type === "capture") && (
              <img src="/type-02.svg" alt="img type icon" />
            )}
            {type === "text" && <img src="/type-03.svg" alt="text type icon" />}
          </div>
          <span className={type_per_class[type]}>
            {TYPE_LABELS[type] || type.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}

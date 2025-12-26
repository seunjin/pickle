import type { NoteWithAsset } from "@pickle/contracts/src/note";
import type { HTMLAttributes } from "react";

interface NoteCardHeaderProps {
  type: NoteWithAsset["type"];
  createdAt: string;
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
  text: "font-medium text-sm text-blue-500 tracking-wider",
  image: "font-medium text-sm text-green-500 tracking-wider",
  capture: "font-medium text-sm text-green-500 tracking-wider",
  bookmark: "font-medium text-sm text-yellow-500 tracking-wider",
};

const type_per_icon: Record<
  NoteWithAsset["type"],
  HTMLAttributes<"span">["className"]
> = {
  text: "size-6 rounded-sm bg-blue-500/10",
  image: "size-6 rounded-sm bg-green-500/10",
  capture: "size-6 rounded-sm bg-green-500/10",
  bookmark: "size-6 rounded-sm bg-yellow-500/10",
};
export function NoteCardHeader({ type, createdAt }: NoteCardHeaderProps) {
  return (
    <div className="mb-3 flex w-full items-center justify-between">
      <div className="flex w-full items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={type_per_icon[type]}></div>
          <span className={type_per_class[type]}>
            {TYPE_LABELS[type] || type.toUpperCase()}
          </span>
        </div>
        <span className="text-[13px] text-neutral-600 leading-1">
          {new Date(createdAt).toLocaleDateString("ko-KR")}
        </span>
      </div>
    </div>
  );
}

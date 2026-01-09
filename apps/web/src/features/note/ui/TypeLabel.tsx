import type { NoteWithAsset } from "@pickle/contracts";
import { cn } from "@pickle/ui/lib/utils";
import type { HTMLAttributes } from "react";

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
  text: "text-blue-500",
  image: "text-green-500",
  capture: "text-green-500",
  bookmark: "text-yellow-500",
};

const type_per_icon: Record<
  NoteWithAsset["type"],
  HTMLAttributes<"span">["className"]
> = {
  text: "flex items-center justify-center size-6 rounded-sm bg-blue-500/10",
  image: "flex items-center justify-center size-6 rounded-sm bg-green-500/10",
  capture: "flex items-center justify-center size-6 rounded-sm bg-green-500/10",
  bookmark:
    "flex items-center justify-center size-6 rounded-sm bg-yellow-500/10",
};
interface TypeLabelProps {
  type: NoteWithAsset["type"];
  mode?: "default" | "detail";
  onlySymbol?: boolean;
}
export function TypeLabel({
  type,
  mode = "default",
  onlySymbol,
}: TypeLabelProps) {
  const imageType = type === "image" || type === "capture";
  return (
    <div
      className={cn(
        "flex items-center",
        mode === "default" ? "gap-1" : "gap-1.5",
      )}
    >
      <div className={cn(mode === "detail" && type_per_icon[type])}>
        {type === "bookmark" && (
          <img src="/type-01.svg" alt="bookmark type icon" />
        )}
        {imageType && <img src="/type-02.svg" alt="img type icon" />}
        {type === "text" && <img src="/type-03.svg" alt="text type icon" />}
      </div>
      {!onlySymbol && (
        <span
          className={cn(
            "font-medium tracking-wider",
            mode === "default" ? "text-[13px]" : "text-[14px]",
            type_per_class[type],
          )}
        >
          {imageType ? "IMAGE" : TYPE_LABELS[type] || type.toUpperCase()}
        </span>
      )}
    </div>
  );
}

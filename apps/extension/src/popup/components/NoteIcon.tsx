import { cn } from "@pickle/ui/lib/utils";

export type NoteIconType = "image" | "capture" | "text" | "bookmark";
export interface NoteIconProps {
  type: NoteIconType;
  className?: HTMLDivElement["className"];
}
export function NoteIcon({ type, className }: NoteIconProps) {
  const commonClass = "flex items-center justify-center size-6 rounded-sm";
  switch (type) {
    case "bookmark":
      return (
        <div className={cn(commonClass, "bg-yellow-500/10", className)}>
          <img src="/type-01.svg" alt="" />
        </div>
      );
    case "image":
      return (
        <div className={cn(commonClass, "bg-green-500/10", className)}>
          <img src="/type-02.svg" alt="" />
        </div>
      );
    case "capture":
      return (
        <div className={cn(commonClass, "bg-[#BA6FFF]/13", className)}>
          <img src="/type-04.svg" alt="" />
        </div>
      );
    case "text":
      return (
        <div className={cn(commonClass, "bg-blue-500/15", className)}>
          <img src="/type-03.svg" alt="" />
        </div>
      );
  }
}

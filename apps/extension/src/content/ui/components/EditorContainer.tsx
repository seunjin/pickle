import { cn } from "@pickle/ui/lib/utils";
import { OVERLAY_DIMENSIONS } from "@/shared/layout";

export function EditorContainer({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cn("grid grid-rows-[auto_1fr_auto] gap-5 rounded-[inherit]")}
      style={{
        width: OVERLAY_DIMENSIONS.width,
        height: OVERLAY_DIMENSIONS.height,
      }}
    >
      {children}
    </div>
  );
}

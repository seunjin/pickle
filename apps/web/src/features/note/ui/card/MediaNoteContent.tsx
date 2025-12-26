import type { NoteWithAsset } from "@pickle/contracts/src/note";
import { AssetImage } from "../AssetImage";

interface MediaNoteContentProps {
  type: "image" | "capture";
  data: Extract<
    NoteWithAsset["data"],
    { alt_text?: string } | { width: number }
  >;
  asset: NoteWithAsset["assets"];
}

export function MediaNoteContent({ type, data, asset }: MediaNoteContentProps) {
  // 에셋 이미지 렌더링
  if (asset) {
    const altText =
      type === "image" && "alt_text" in data ? data.alt_text : "Capture";

    return (
      <div className="relative aspect-video w-full overflow-hidden">
        <AssetImage
          path={asset.full_path}
          alt={altText || "Image"}
          className="h-full w-full"
        />
      </div>
    );
  }

  // 대체 (메타만 존재, 에셋 없음)
  return (
    <p className="line-clamp-2 text-neutral-400 text-xs italic">
      {type === "image" && "alt_text" in data
        ? data.alt_text
        : "Captured area from screen"}
    </p>
  );
}

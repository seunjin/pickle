import type { NoteWithAsset } from "@pickle/contracts";
import { cn } from "@pickle/ui/lib/utils";
import type { CSSProperties } from "react";
import { AssetImage } from "../AssetImage";

export const Thumbnail = ({
  note,
  className,
  style,
  objectFit = "cover",
}: {
  note: NoteWithAsset;
  className?: HTMLDivElement["className"];
  style?: CSSProperties;
  objectFit?: "cover" | "contain" | "none" | "scale-down";
}) => {
  const objectFitClass = {
    contain: "object-contain",
    cover: "object-cover",
    none: "object-none",
    "scale-down": "object-scale-down",
  };
  const ThumbnailNoImage = () => {
    return (
      <div className="flex h-full w-full select-none items-center justify-center bg-green-400">
        <img src="/symbol-black.svg" alt="symbol-black" />
      </div>
    );
  };
  const renderThumbnail = () => {
    switch (note.type) {
      case "bookmark":
        return note.type === "bookmark" && note.meta?.image ? (
          <img
            src={note.meta.image}
            alt={note.meta?.description}
            className={cn(
              "h-full w-full",
              objectFitClass[objectFit],
              "transition-transform duration-300 ease-in-out group-hover/note-card:scale-105",
            )}
            loading="lazy"
            width={note.meta.image_width}
            height={note.meta.image_height}
          />
        ) : (
          <ThumbnailNoImage />
        );
      case "image":
        return note.assets ? (
          <AssetImage
            path={note.assets?.full_path}
            alt={""}
            objectFit={objectFit}
            blurDataUrl={note.assets?.blur_data_url}
          />
        ) : (
          <ThumbnailNoImage />
        );
      case "capture":
        return note.assets ? (
          <AssetImage
            path={note.assets?.full_path}
            alt={""}
            objectFit={objectFit}
            blurDataUrl={note.assets?.blur_data_url}
          />
        ) : (
          <ThumbnailNoImage />
        );

      default:
        return null;
    }
  };

  return renderThumbnail() ? (
    <div style={style} className={className}>
      {renderThumbnail()}
    </div>
  ) : null;
};

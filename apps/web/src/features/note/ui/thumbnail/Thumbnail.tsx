import type { NoteWithAsset } from "@pickle/contracts";
import { cn } from "@pickle/ui/lib/utils";
import { AssetImage } from "../AssetImage";

export const Thumbnail = ({
  note,
  className,
}: {
  note: NoteWithAsset;
  className?: HTMLDivElement["className"];
}) => {
  const ThumbnailNoImage = () => {
    return (
      <div className="flex w-full select-none items-center justify-center bg-base-muted text-center font-semibold text-base text-neutral-600">
        No Image
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
            className={cn("h-full w-full object-cover")}
            loading="lazy"
          />
        ) : (
          <ThumbnailNoImage />
        );
      case "image":
        return note.assets ? (
          <AssetImage
            path={note.assets?.full_path}
            alt={""}
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
    <div className={className}>{renderThumbnail()}</div>
  ) : null;
};

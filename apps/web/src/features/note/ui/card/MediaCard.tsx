import type { NoteWithAsset } from "@pickle/contracts";
import { cn } from "@pickle/ui/lib/utils";
import { TAG_VARIANTS, type TagColor } from "@/shared/constants/tag";
import { AssetImage } from "../AssetImage";
import { NoteCardContainer } from "./NoteCardContainer";
import { NoteCardHeader } from "./NoteCardHeader";

interface NoteCardProps {
  note: Extract<NoteWithAsset, { type: "image" | "capture" }>;
  onDelete: (id: string) => void;
}
export const MediaCard = ({ note }: NoteCardProps) => {
  return (
    <NoteCardContainer>
      <div className="relative aspect-video w-full overflow-hidden">
        {note.assets ? (
          <AssetImage
            path={note.assets?.full_path}
            alt={""}
            className="h-full w-full"
          />
        ) : (
          <div className="h-[190px] w-full select-none bg-base-muted text-center font-semibold text-base text-neutral-600">
            No Image
          </div>
        )}
      </div>

      <div className="px-4 pt-3 pb-4">
        <NoteCardHeader type={note.type} createdAt={note.created_at} />
        {/* 메인 콘텐츠 */}
        <div className="pb-4">
          <div className="flex items-center gap-2">
            {/* 파비콘 */}
            <div className="relative h-4 w-4 shrink-0 overflow-hidden rounded bg-white">
              {note.meta.favicon && (
                <img
                  src={note.meta.favicon}
                  alt=""
                  className="h-full w-full object-contain"
                />
              )}
            </div>
            <div className="truncate font-semibold text-base text-neutral-100">
              {/* {note.meta.site_name || new URL(note.meta.
                                        url).hostname} */}
              {note.meta.title}
            </div>
          </div>
          <div className="truncate text-[13px] text-base-muted">
            {note.meta.description}
          </div>
        </div>
        <div className="flex gap-1.5">
          {/* tags */}
          {[
            { id: 1, color: "purple", name: "design" },
            { id: 2, color: "orange", name: "React" },
          ].map((tag) => (
            <span
              key={tag.id}
              className={cn(
                "rounded border px-2 py-1 text-xs",
                TAG_VARIANTS[tag.color as TagColor],
              )}
            >
              #{tag.name}
            </span>
          ))}
        </div>
      </div>
    </NoteCardContainer>
  );
};

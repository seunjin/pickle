import type { NoteWithAsset } from "@pickle/contracts/src/note";
import { cn } from "@pickle/ui/lib/utils";
import { TAG_VARIANTS, type TagColor } from "@/shared/constants/tag";
import { NoteCardContainer } from "./NoteCardContainer";
import { NoteCardHeader } from "./NoteCardHeader";

interface NoteCardProps {
  note: Extract<NoteWithAsset, { type: "bookmark" }>;
  onDelete: (id: string) => void;
}

export function BookmarkCard({ note }: NoteCardProps) {
  return (
    <NoteCardContainer>
      {note.meta?.image ? (
        <img
          src={note.meta.image}
          alt={note.meta?.description}
          className={cn("h-[190px] w-full object-cover")}
        />
      ) : (
        <div className="flex h-[190px] w-full select-none items-center justify-center bg-base-muted text-center font-semibold text-base text-neutral-600">
          No Image
        </div>
      )}
      <div className="px-4 pt-3 pb-4">
        <NoteCardHeader type="bookmark" createdAt={note.created_at} />
        {/* 메인 콘텐츠 */}
        <div className="pb-4">
          <div className="flex items-center gap-2">
            {/* 파비콘 */}
            <div className="relative h-4 w-4 shrink-0 overflow-hidden rounded bg-white">
              {note.meta?.favicon && (
                <img
                  src={note.meta.favicon}
                  alt=""
                  className="h-full w-full object-contain"
                />
              )}
            </div>
            <div className="truncate font-semibold text-base text-neutral-100">
              {/* [Refactor] Use top-level title directly */}
              {note.title || "Untitled"}
            </div>
          </div>
          <div className="truncate text-[13px] text-base-muted">
            {note.meta?.description}
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
}

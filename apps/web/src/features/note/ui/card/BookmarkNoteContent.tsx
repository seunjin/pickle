import type { NoteWithAsset } from "@pickle/contracts/src/note";

interface BookmarkNoteContentProps {
  url: string;
  data: Extract<NoteWithAsset["data"], { title: string }>;
  meta: NoteWithAsset["meta"];
}

export function BookmarkNoteContent({
  url,
  data,
  meta,
}: BookmarkNoteContentProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="group/link block"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col gap-3 rounded-xl bg-neutral-800/50 p-3 transition-colors group-hover/link:bg-neutral-800">
        {data.image && (
          <div className="aspect-2/1 w-full overflow-hidden rounded-lg">
            <img
              src={data.image}
              alt=""
              className="h-full w-full object-cover transition-transform group-hover/link:scale-105"
              referrerPolicy="no-referrer"
            />
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            {meta.favicon && (
              <img
                src={meta.favicon}
                alt=""
                className="h-3.5 w-3.5 object-contain"
              />
            )}
            <span className="truncate font-semibold text-neutral-100 text-xs">
              {data.title || url}
            </span>
          </div>
          {data.description && (
            <p className="line-clamp-2 text-[11px] text-neutral-500 leading-normal">
              {data.description}
            </p>
          )}
        </div>
      </div>
    </a>
  );
}

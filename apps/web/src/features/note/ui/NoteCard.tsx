"use client";
import type { NoteWithAsset } from "@pickle/contracts/src/note";
import { AssetImage } from "./AssetImage";

interface NoteCardProps {
  note: NoteWithAsset;
  onDelete: (id: string) => void;
}

export function NoteCard({ note, onDelete }: NoteCardProps) {
  const asset = note.assets;

  // 노트 타입별 라벨
  const typeLabels: Record<string, string> = {
    text: "TEXT",
    image: "IMG",
    capture: "IMG",
    bookmark: "URL",
  };

  return (
    <div className="overflow-hidden rounded-xl border border-card-border bg-card-background transition-all hover:border-base-primary/50">
      {/* Header / Meta */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {/* 타입 칩 */}
          <span className="rounded bg-base-foreground-background px-2 py-0.5 font-medium text-base-muted text-xs">
            {typeLabels[note.type] || note.type.toUpperCase()}
          </span>
          <span className="text-base-muted text-xs">
            {new Date(note.created_at).toLocaleDateString("ko-KR")}
          </span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            if (confirm("정말 삭제하시겠습니까?")) {
              onDelete(note.id);
            }
          }}
          className="rounded p-1 text-base-muted transition-colors hover:bg-red-900/20 hover:text-red-400"
          title="Delete Note"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Body Content */}
      <div className="px-4 pb-4">
        {note.content && (
          <p className="mb-3 line-clamp-3 text-base-foreground text-sm leading-relaxed">
            {note.content}
          </p>
        )}

        {/* Type Specific Rendering */}
        {note.type === "text" && (
          <div className="rounded-lg bg-base-foreground-background p-3 font-mono text-base-muted text-xs">
            {note.data.text}
          </div>
        )}

        {/* Image / Capture with Asset */}
        {(note.type === "image" || note.type === "capture") && asset && (
          <AssetImage
            path={asset.full_path}
            alt={
              note.type === "image" ? note.data.alt_text || "Image" : "Capture"
            }
            className="mt-2 rounded-lg"
          />
        )}

        {note.type === "bookmark" && (
          <a
            href={note.url}
            target="_blank"
            rel="noreferrer"
            className="mt-2 block"
          >
            <div className="flex flex-col gap-2 rounded-lg bg-base-foreground-background p-3 transition-colors hover:bg-neutral-800">
              {note.data.image && (
                <div className="aspect-video w-full overflow-hidden rounded-md bg-neutral-800">
                  <img
                    src={note.data.image}
                    alt=""
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
              <div className="flex items-center gap-2">
                {note.data.favicon && (
                  <div className="relative h-4 w-4 shrink-0">
                    <img
                      src={note.data.favicon}
                      alt=""
                      className="h-full w-full object-contain"
                    />
                  </div>
                )}
                <span className="truncate font-medium text-base-foreground text-sm">
                  {note.data.title || note.url}
                </span>
              </div>
            </div>
          </a>
        )}

        {/* URL Fallback */}
        {note.type !== "bookmark" && note.url && (
          <a
            href={note.url}
            target="_blank"
            rel="noreferrer"
            className="mt-3 block truncate text-base-muted text-xs hover:text-base-primary"
          >
            {note.url}
          </a>
        )}

        {/* 태그 영역 (placeholder - DB에 태그가 있으면 표시) */}
        {/* TODO: note.tags 데이터 연결 */}
      </div>
    </div>
  );
}

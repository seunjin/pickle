"use client";
import type { NoteWithAsset } from "@pickle/contracts/src/note";
import { AssetImage } from "./AssetImage";

interface NoteCardProps {
  note: NoteWithAsset;
  onDelete: (id: string) => void;
}

export function NoteCard({ note, onDelete }: NoteCardProps) {
  const asset = note.assets;

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Header / Meta */}
      <div className="flex justify-between border-b bg-gray-50 px-4 py-2 text-gray-500 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-700 capitalize">
            {note.type}
          </span>
          <span>{new Date(note.created_at).toLocaleDateString()}</span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            if (confirm("정말 삭제하시겠습니까?")) {
              onDelete(note.id);
            }
          }}
          className="text-gray-400 hover:text-red-500"
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

      {/* Body Content based on type */}
      <div className="p-4">
        {note.content && (
          <p className="mb-2 line-clamp-3 text-gray-800 text-sm">
            {note.content}
          </p>
        )}

        {/* Type Specific Rendering - Fully Type Safe */}
        {note.type === "text" && (
          <div className="rounded bg-gray-100 p-2 font-mono text-gray-600 text-xs">
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
            className="mt-2"
          />
        )}

        {note.type === "bookmark" && (
          <a
            href={note.url}
            target="_blank"
            rel="noreferrer"
            className="mt-2 block"
          >
            <div className="flex flex-col gap-2 rounded bg-blue-50 p-2 text-blue-700 transition-colors hover:bg-blue-100">
              {note.data.image && (
                <div className="aspect-video w-full overflow-hidden rounded-md bg-gray-200">
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
                <span className="truncate font-medium text-sm">
                  {note.data.title || note.url}
                </span>
              </div>
            </div>
          </a>
        )}

        {/* Fallback for url if no specific view */}
        {note.type !== "bookmark" && (
          <a
            href={note.url}
            target="_blank"
            rel="noreferrer"
            className="mt-2 block truncate text-gray-400 text-xs hover:text-gray-600"
          >
            {note.url}
          </a>
        )}
      </div>
    </div>
  );
}

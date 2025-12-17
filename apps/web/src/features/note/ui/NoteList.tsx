import Image from "next/image";

import { useNote } from "../model/useNote";
import { AssetImage } from "./AssetImage";

export const NoteList = () => {
  const { notes, isLoading, isError } = useNote();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 w-full animate-pulse rounded-lg bg-gray-200"
            />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-600">
        Failed to load notes.
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        <p>No notes yet.</p>
        <p className="text-sm">Create a note from the extension!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {notes.map((note) => {
        // note is NoteWithAsset (Discriminated Union)
        // No casting needed! TS knows exactly what note.data is based on note.type
        const asset = note.assets;

        return (
          <div
            key={note.id}
            className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            {/* Header / Meta */}
            <div className="flex justify-between border-b bg-gray-50 px-4 py-2 text-gray-500 text-xs">
              <span className="font-medium text-gray-700 capitalize">
                {note.type}
              </span>
              <span>{new Date(note.created_at).toLocaleDateString()}</span>
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
                    note.type === "image"
                      ? note.data.alt_text || "Image"
                      : "Capture"
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
                  <div className="flex items-center gap-2 rounded bg-blue-50 p-2 text-blue-700 transition-colors hover:bg-blue-100">
                    {note.data.favicon && (
                      <div className="relative h-4 w-4 shrink-0">
                        <Image
                          src={note.data.favicon}
                          alt=""
                          fill
                          className="object-contain"
                        />
                      </div>
                    )}
                    <span className="truncate font-medium text-sm">
                      {note.data.title || note.url}
                    </span>
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
      })}
    </div>
  );
};

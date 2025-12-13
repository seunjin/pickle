import type { Note } from "@pickle/contracts/src/note";
import Image from "next/image";
import { useNote } from "../model/useNote";

// Helper type for note data to avoid excessive 'any' casting
interface NoteDataShape {
  text?: string;
  url?: string;
  title?: string;
  description?: string;
  favicon?: string;
  image_url?: string;
  screenshot_url?: string;
  [key: string]: unknown;
}

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
      {notes.map((note: Note) => {
        const data = note.data as NoteDataShape;

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

              {/* Type Specific Rendering */}
              {note.type === "text" && (
                <div className="rounded bg-gray-100 p-2 font-mono text-gray-600 text-xs">
                  {data.text}
                </div>
              )}

              {note.type === "bookmark" && (
                <a
                  href={note.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 block"
                >
                  <div className="flex items-center gap-2 rounded bg-blue-50 p-2 text-blue-700 transition-colors hover:bg-blue-100">
                    {data.favicon && (
                      <div className="relative h-4 w-4 shrink-0">
                        <Image
                          src={data.favicon}
                          alt=""
                          fill
                          className="object-contain"
                        />
                      </div>
                    )}
                    <span className="truncate font-medium text-sm">
                      {data.title || note.url}
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

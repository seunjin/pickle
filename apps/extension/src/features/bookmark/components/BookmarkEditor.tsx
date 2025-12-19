import { Header } from "@overlay/components/Header";
import type { NoteData } from "@shared/types";

/**
 * BookmarkEditor Component
 *
 * 북마크 저장 화면 컴포넌트입니다.
 * 현재 페이지의 메타데이터(OG 태그 등)를 추출하여 보여주고, 사용자가 메모를 추가하여 저장할 수 있습니다.
 */

interface BookmarkEditorProps {
  note: NoteData;
  onUpdate: (data: Partial<NoteData>) => void;
  onClose: () => void;
  onSave?: () => void;
}

export function BookmarkEditor({
  note,
  onUpdate,
  onClose,
  onSave,
}: BookmarkEditorProps) {
  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <Header title="북마크 저장" onClose={onClose} />
      {note.isLoading ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-yellow-600">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-yellow-600 border-t-transparent"></div>
          <p className="animate-pulse font-semibold text-sm">
            페이지 분석 중...
          </p>
        </div>
      ) : note.bookmarkData ? (
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
          <div className="group overflow-hidden rounded-xl border bg-gray-50 shadow-sm transition-shadow hover:shadow-md">
            {note.bookmarkData.image && (
              <img
                src={note.bookmarkData.image}
                alt="OG Img"
                className="h-32 w-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  console.error("Image load failed:", note.bookmarkData?.image);
                  e.currentTarget.style.display = "none";
                }}
              />
            )}
            <div className="flex flex-col gap-2 p-3">
              <div className="flex items-center gap-1.5 opacity-70">
                {note.bookmarkData.favicon ? (
                  <img
                    src={note.bookmarkData.favicon}
                    alt=""
                    className="h-3 w-3"
                  />
                ) : (
                  <span className="text-[10px]">🔗</span>
                )}
                <span className="font-semibold text-[10px] text-gray-500">
                  {note.bookmarkData.site_name}
                </span>
              </div>
              <div>
                <h3 className="mb-1 line-clamp-2 font-bold text-sm leading-tight">
                  {note.bookmarkData.title}
                </h3>
                <p className="line-clamp-2 text-gray-500 text-xs">
                  {note.bookmarkData.description}
                </p>
              </div>
              <div className="mt-1 flex flex-col gap-0.5 border-gray-100 border-t pt-2">
                <a
                  href={note.bookmarkData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate text-[10px] text-blue-500 hover:underline"
                >
                  {note.bookmarkData.url}
                </a>
                <span className="text-right text-[10px] text-gray-400">
                  {note.timestamp
                    ? new Date(note.timestamp).toLocaleDateString()
                    : ""}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <label
              htmlFor="bookmark-note"
              className="font-medium text-gray-500 text-xs"
            >
              Note
            </label>
            <textarea
              id="bookmark-note"
              className="h-full w-full resize-none rounded-lg border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="이 페이지에 대한 생각을 남겨보세요..."
              value={note.memo || ""}
              onChange={(e) => onUpdate({ memo: e.target.value })}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center text-gray-400">
          <p>데이터를 불러올 수 없습니다.</p>
        </div>
      )}
      <button
        type="button"
        disabled={!note.bookmarkData}
        onClick={onSave}
        className="w-full rounded-lg bg-yellow-500 py-3 font-bold text-white shadow-md transition-colors hover:bg-yellow-600"
      >
        Save Bookmark
      </button>
    </div>
  );
}

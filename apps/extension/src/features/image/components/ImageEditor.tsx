import { Header } from "@overlay/components/Header";
import type { NoteData } from "@shared/types";

/**
 * ImageEditor Component
 *
 * 웹페이지 내 이미지 저장 컴포넌트입니다.
 * 사용자가 선택한 이미지를 미리보기로 보여주고, 메모를 추가하여 저장할 수 있습니다.
 */

interface ImageEditorProps {
  note: NoteData;
  onUpdate: (data: Partial<NoteData>) => void;
  onClose: () => void;
  onSave?: () => void;
}

export function ImageEditor({
  note,
  onUpdate,
  onClose,
  onSave,
}: ImageEditorProps) {
  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <Header title="이미지 저장" onClose={onClose} />

      <div className="group relative flex flex-1 flex-col items-center justify-center overflow-hidden rounded-lg border bg-gray-100">
        {note.srcUrl ? (
          <img
            src={note.srcUrl}
            alt="Captured content"
            className="max-h-full max-w-full object-contain shadow-lg"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <span className="text-4xl">🖼️</span>
            <p className="text-sm">이미지를 찾을 수 없습니다.</p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="image-note"
          className="font-medium text-gray-500 text-xs"
        >
          Note
        </label>
        <textarea
          id="image-note"
          className="h-20 w-full resize-none rounded-lg border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="이미지에 대한 메모를 남겨보세요..."
          onChange={(e) => onUpdate({ text: e.target.value })}
        />
      </div>

      <button
        type="button"
        disabled={!note.srcUrl}
        onClick={onSave}
        className={`w-full rounded-lg py-3 font-bold text-white shadow-md transition-colors ${
          note.srcUrl
            ? "bg-purple-600 hover:bg-purple-700"
            : "cursor-not-allowed bg-gray-400"
        }`}
      >
        Save Image
      </button>
    </div>
  );
}

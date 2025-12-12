import { Header } from "@overlay/components/Header";
import type { NoteData } from "@shared/types";

/**
 * TextEditor Component
 *
 * 텍스트 저장 화면 컴포넌트입니다.
 * 웹페이지에서 드래그하여 선택한 텍스트와 원본 URL을 함께 저장할 수 있는 에디터를 제공합니다.
 */

interface TextEditorProps {
  note: NoteData;
  onUpdate: (data: Partial<NoteData>) => void;
  onBack: () => void;
  onClose: () => void;
}

export function TextEditor({
  note,
  onUpdate,
  onBack,
  onClose,
}: TextEditorProps) {
  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <Header title="텍스트 저장" onBack={onBack} onClose={onClose} />
      <div className="flex flex-col gap-1">
        <label
          htmlFor="url-input"
          className="font-medium text-gray-500 text-xs"
        >
          URL
        </label>
        <input
          id="url-input"
          type="text"
          value={note.url || ""}
          readOnly
          className="w-full truncate rounded border bg-gray-50 p-2 text-gray-400 text-xs"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <label
          htmlFor="note-content"
          className="font-medium text-gray-500 text-xs"
        >
          Content
        </label>
        <textarea
          id="note-content"
          value={note.text || ""}
          onChange={(e) => onUpdate({ text: e.target.value })}
          className="h-full w-full resize-none rounded-lg border p-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="저장할 텍스트를 입력하세요..."
        />
      </div>
      <button
        type="button"
        className="w-full rounded-lg bg-green-600 py-3 font-bold text-white shadow-md transition-colors hover:bg-green-700"
      >
        Save to Pickle
      </button>
    </div>
  );
}

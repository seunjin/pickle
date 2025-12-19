import { Header } from "@overlay/components/Header";
import type { CaptureData, NoteData } from "@shared/types";
import { useEffect, useState } from "react";

/**
 * CaptureEditor Component
 *
 * 화면 캡쳐 저장 및 미리보기 컴포넌트입니다.
 * 드래그하여 선택한 영역의 스크린샷을 보여주고, 메모와 함께 저장할 수 있는 기능을 제공합니다.
 */

interface CaptureEditorProps {
  note: NoteData;
  onUpdate: (data: Partial<NoteData>) => void;
  onClose: () => void;
  onSave?: () => void;
}

function CapturePreview({ captureData }: { captureData: CaptureData }) {
  const [croppedImage, setCroppedImage] = useState<string | null>(null);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      const { x, y, width, height } = captureData.area;
      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, x, y, width, height, 0, 0, width, height);
      setCroppedImage(canvas.toDataURL());
    };

    img.src = captureData.image;
  }, [captureData]);

  if (!croppedImage)
    return <div className="h-full w-full animate-pulse bg-gray-200" />;

  return (
    <img
      src={croppedImage}
      alt="Cropped capture"
      className="max-h-full max-w-full object-contain shadow-lg"
    />
  );
}

export function CaptureEditor({
  note,
  onUpdate,
  onClose,
  onSave,
}: CaptureEditorProps) {
  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <Header title="캡쳐 저장" onClose={onClose} />
      <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-lg border bg-gray-100">
        {note.isLoading ? (
          <div className="flex flex-col items-center gap-2 text-blue-600">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            <p className="animate-pulse font-semibold text-sm">
              캡쳐 처리 중...
            </p>
          </div>
        ) : note.captureData ? (
          <CapturePreview captureData={note.captureData} />
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <span className="animate-bounce text-2xl">🖱️</span>
            <p className="text-sm">화면을 드래그하여 선택하세요...</p>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <label
          htmlFor="capture-note"
          className="font-medium text-gray-500 text-xs"
        >
          Note
        </label>
        <textarea
          id="capture-note"
          className="h-20 w-full resize-none rounded-lg border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="캡쳐에 대한 메모를 남겨보세요..."
          value={note.memo || ""}
          onChange={(e) => onUpdate({ memo: e.target.value })}
        />
      </div>
      <button
        type="button"
        disabled={!note.captureData}
        onClick={onSave}
        className={`w-full rounded-lg py-3 font-bold text-white shadow-md transition-colors ${
          note.captureData
            ? "bg-blue-600 hover:bg-blue-700"
            : "cursor-not-allowed bg-gray-400"
        }`}
      >
        Save Capture
      </button>
    </div>
  );
}

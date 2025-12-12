import { useEffect, useState } from "react";
import "./App.css";

type ViewType = "menu" | "image" | "capture" | "text" | "bookmark";

interface CaptureData {
  image: string; // Base64 Data URL
  area: { x: number; y: number; width: number; height: number };
}

interface NoteData {
  text?: string;
  url?: string;
  srcUrl?: string;
  timestamp?: number;
  mode?: ViewType;
  captureData?: CaptureData;
  isLoading?: boolean; // 로딩 상태 추가
}

// ... imports and interfaces ... (kept same)

function App() {
  const [view, setView] = useState<ViewType>("menu");
  const [note, setNote] = useState<NoteData>({ text: "", url: "" });

  useEffect(() => {
    // 1. 초기 로드 시 Storage 확인
    chrome.storage.local.get("pendingNote", (result) => {
      if (result.pendingNote) {
        const data = result.pendingNote as NoteData;
        setNote(data);
        if (data.mode) {
          setView(data.mode);
        }
      }
    });

    // 2. Storage 변경 감지
    const handleStorageChange = (changes: {
      [key: string]: chrome.storage.StorageChange;
    }) => {
      if (changes.pendingNote?.newValue) {
        const newData = changes.pendingNote.newValue as NoteData;
        setNote(newData);
        if (newData.mode) {
          setView(newData.mode);
        }
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, []);

  const handleBack = () => setView("menu");

  const openWebApp = () => {
    chrome.tabs.create({ url: "https://picklenote.vercel.app" });
  };

  // --- Views ---

  const renderCaptureEditor = () => {
    return (
      <div className="flex h-full flex-col gap-3 p-4">
        <Header title="캡쳐 저장" onBack={handleBack} />

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
          />
        </div>

        <button
          type="button"
          disabled={!note.captureData} // 캡쳐 데이터 없으면 비활성
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
  };

  const renderTextEditor = () => (
    <div className="flex h-full flex-col gap-3 p-4">
      <Header title="텍스트 저장" onBack={handleBack} />
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
          value={note.url}
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
          value={note.text}
          onChange={(e) => setNote({ ...note, text: e.target.value })}
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

  const renderMenu = () => (
    <div className="flex h-full flex-col gap-4 p-4">
      <h1 className="mb-2 text-center font-bold text-xl">Pickle Note</h1>
      <div className="grid flex-1 grid-cols-2 gap-3 overflow-y-auto">
        <MenuButton
          label="이미지 저장"
          icon="🖼️"
          color="bg-purple-100 hover:bg-purple-200 text-purple-900"
          onClick={() => setView("image")}
        />
        <MenuButton
          label="캡쳐하기"
          icon="📷"
          color="bg-blue-100 hover:bg-blue-200 text-blue-900"
          onClick={() => setView("capture")}
        />
        <MenuButton
          label="텍스트 저장"
          icon="📝"
          color="bg-green-100 hover:bg-green-200 text-green-900"
          onClick={() => setView("text")}
        />
        <MenuButton
          label="북마크"
          icon="🔖"
          color="bg-yellow-100 hover:bg-yellow-200 text-yellow-900"
          onClick={() => setView("bookmark")}
        />
        <button
          type="button"
          onClick={openWebApp}
          className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-gray-100 p-4 font-semibold text-gray-800 shadow-sm transition-all hover:bg-gray-200"
        >
          🚀 Pickle Note 가기
        </button>
      </div>
    </div>
  );

  const renderPlaceholder = (title: string, icon: string) => (
    <div className="flex h-full flex-col p-4">
      <Header title={title} onBack={handleBack} />
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-gray-400">
        <span className="text-6xl">{icon}</span>
        <p className="text-sm">기능 준비 중입니다.</p>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-full bg-white text-gray-900">
      {view === "menu" && renderMenu()}
      {view === "text" && renderTextEditor()}
      {view === "capture" && renderCaptureEditor()}
      {view === "image" && renderPlaceholder("이미지 저장", "🖼️")}
      {view === "bookmark" && renderPlaceholder("북마크", "🔖")}
    </div>
  );
}

// ... components ...

// --- Components ---

function CapturePreview({ captureData }: { captureData: CaptureData }) {
  const [croppedImage, setCroppedImage] = useState<string | null>(null);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      const { x, y, width, height } = captureData.area;
      // 캔버스 크기를 잘라낼 영역 크기로 설정
      canvas.width = width;
      canvas.height = height;

      // 이미지의 특정 영역만 캔버스에 그리기
      // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
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

function MenuButton({
  label,
  icon,
  color,
  onClick,
}: {
  label: string;
  icon: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2 rounded-2xl p-6 shadow-sm transition-all active:scale-95 ${color}`}
    >
      <span className="text-3xl">{icon}</span>
      <span className="font-semibold text-sm">{label}</span>
    </button>
  );
}

function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="mb-2 flex items-center gap-3">
      <button
        type="button"
        onClick={onBack}
        className="rounded-full p-2 transition-colors hover:bg-gray-100"
      >
        ◀
      </button>
      <h2 className="font-bold text-lg">{title}</h2>
    </div>
  );
}

export default App;

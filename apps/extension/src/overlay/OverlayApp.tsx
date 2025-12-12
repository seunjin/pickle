import { useEffect, useState } from "react";
import "../index.css"; // Ensure Tailwind is processed

type ViewType = "menu" | "image" | "capture" | "text" | "bookmark";

interface CaptureData {
  image: string;
  area: { x: number; y: number; width: number; height: number };
}

interface BookmarkData {
  title: string;
  description: string;
  image: string;
  url: string;
  site_name?: string;
  favicon?: string;
}

interface NoteData {
  text?: string;
  url?: string;
  srcUrl?: string;
  timestamp?: number;
  mode?: ViewType;
  captureData?: CaptureData;
  bookmarkData?: BookmarkData;
  isLoading?: boolean;
}

export default function OverlayApp({
  onClose,
  tabId,
}: {
  onClose: () => void;
  tabId: number;
}) {
  const [view, setView] = useState<ViewType>("menu");
  const [note, setNote] = useState<NoteData>({});

  // Storage Key: Tab ID 기반으로 분리
  const STORAGE_KEY = `note_${tabId}`;

  // 1. Initial Load & Change Listener
  useEffect(() => {
    // 초기 로드
    chrome.storage.local.get(STORAGE_KEY, (result) => {
      if (result[STORAGE_KEY]) {
        console.log("Loaded note:", result[STORAGE_KEY]);
        const data = result[STORAGE_KEY] as NoteData;
        setNote(data);
        if (data.mode) setView(data.mode);
      }
    });

    // 변경 감지
    const handleStorageChange = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string,
    ) => {
      if (areaName === "local" && changes[STORAGE_KEY]) {
        console.log("Storage changed:", changes[STORAGE_KEY]);
        const newValue = changes[STORAGE_KEY].newValue as NoteData;
        if (newValue) {
          setNote(newValue);
          // 모드가 변경되었으면 뷰도 업데이트 (단, 사용자가 수동으로 이동한 경우 고려 필요)
          // 여기서는 모드가 명시적으로 바뀌었을 때만 뷰 전환
          if (newValue.mode && newValue.mode !== view) {
            setView(newValue.mode);
          }
        }
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, [STORAGE_KEY, view]);

  const handleBack = () => setView("menu");
  const openWebApp = () => {
    chrome.tabs.create({ url: "https://picklenote.vercel.app" });
  };

  // --- Views ---

  const renderCaptureEditor = () => (
    <div className="flex h-full flex-col gap-3 p-4">
      <Header title="캡쳐 저장" onBack={handleBack} onClose={onClose} />
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
        disabled={!note.captureData}
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

  const renderTextEditor = () => (
    <div className="flex h-full flex-col gap-3 p-4">
      <Header title="텍스트 저장" onBack={handleBack} onClose={onClose} />
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
    <div className="relative flex h-full flex-col gap-4 p-4">
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
      >
        ✕
      </button>
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

  const renderBookmarkEditor = () => (
    <div className="flex h-full flex-col gap-3 p-4">
      <Header title="북마크 저장" onBack={handleBack} onClose={onClose} />
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
                  {new Date(note.timestamp || Date.now()).toLocaleDateString()}
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
        className="w-full rounded-lg bg-yellow-500 py-3 font-bold text-white shadow-md transition-colors hover:bg-yellow-600"
      >
        Save Bookmark
      </button>
    </div>
  );

  const renderImageEditor = () => (
    <div className="flex h-full flex-col gap-3 p-4">
      <Header title="이미지 저장" onBack={handleBack} onClose={onClose} />

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
        />
      </div>

      <button
        type="button"
        disabled={!note.srcUrl}
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

  return (
    <div className="fade-in slide-in-from-right-4 fixed top-4 right-4 z-50 h-[600px] w-[360px] animate-in overflow-hidden rounded-2xl border border-gray-200 bg-white font-sans text-gray-900 shadow-2xl duration-300">
      {view === "menu" && renderMenu()}
      {view === "text" && renderTextEditor()}
      {view === "capture" && renderCaptureEditor()}
      {view === "image" && renderImageEditor()}
      {view === "bookmark" && renderBookmarkEditor()}
    </div>
  );
}

// --- Components ---

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

function Header({
  title,
  onBack,
  onClose,
}: {
  title: string;
  onBack: () => void;
  onClose: () => void;
}) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-full p-2 transition-colors hover:bg-gray-100"
        >
          ◀
        </button>
        <h2 className="font-bold text-lg">{title}</h2>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="p-2 text-gray-400 hover:text-gray-600"
      >
        ✕
      </button>
    </div>
  );
}

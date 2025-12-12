import { useEffect, useEffectEvent, useState } from "react";
import "../index.css"; // Ensure Tailwind is processed

import { BookmarkEditor } from "@features/bookmark/components/BookmarkEditor";
import { CaptureEditor } from "@features/capture/components/CaptureEditor";
import { ImageEditor } from "@features/image/components/ImageEditor";
import { TextEditor } from "@features/text/components/TextEditor";
import { Menu } from "@overlay/components/Menu";
import { getNoteKey } from "@shared/storage";
import type { NoteData, ViewType } from "@shared/types";

/**
 * OverlayApp Component
 *
 * 확장 프로그램의 메인 진입점 컴포넌트입니다.
 * 탭별 격리된 상태(NoteData)를 관리하고, 현재 모드(ViewType)에 따라 적절한 에디터 컴포넌트를 렌더링하는 라우터 역할을 수행합니다.
 */

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
  const STORAGE_KEY = getNoteKey(tabId);

  // Event handler that reads reactive 'view' state but remains stable
  const handleStorageChange = useEffectEvent(
    (
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
    },
  );

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

    // useEffectEvent로 생성된 핸들러는 안정적이므로 listener 등록에 안전하게 사용 가능
    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, [STORAGE_KEY]); // handleStorageChange is stable thanks to useEffectEvent

  const handleBack = () => setView("menu");
  const openWebApp = () => {
    chrome.tabs.create({ url: "https://picklenote.vercel.app" });
  };

  const handleUpdateNote = (data: Partial<NoteData>) => {
    setNote((prev) => ({ ...prev, ...data }));
  };

  return (
    <div className="fade-in slide-in-from-right-4 fixed top-4 right-4 z-50 h-[600px] w-[360px] animate-in overflow-hidden rounded-2xl border border-gray-200 bg-white font-sans text-gray-900 shadow-2xl duration-300">
      {view === "menu" && (
        <Menu onNavigate={setView} onClose={onClose} openWebApp={openWebApp} />
      )}
      {view === "text" && (
        <TextEditor
          note={note}
          onUpdate={handleUpdateNote}
          onBack={handleBack}
          onClose={onClose}
        />
      )}
      {view === "capture" && (
        <CaptureEditor
          note={note}
          onUpdate={handleUpdateNote}
          onBack={handleBack}
          onClose={onClose}
        />
      )}
      {view === "image" && (
        <ImageEditor
          note={note}
          onUpdate={handleUpdateNote}
          onBack={handleBack}
          onClose={onClose}
        />
      )}
      {view === "bookmark" && (
        <BookmarkEditor
          note={note}
          onUpdate={handleUpdateNote}
          onBack={handleBack}
          onClose={onClose}
        />
      )}
    </div>
  );
}

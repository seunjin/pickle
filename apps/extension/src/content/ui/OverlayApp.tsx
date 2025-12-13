import { useEffect, useEffectEvent, useState } from "react";
import "../../index.css"; // Ensure Tailwind is processed

import { BookmarkEditor } from "@features/bookmark/components/BookmarkEditor";
import { CaptureEditor } from "@features/capture/components/CaptureEditor";
import { ImageEditor } from "@features/image/components/ImageEditor";
import { TextEditor } from "@features/text/components/TextEditor";
import { saveNote } from "@shared/api/note";
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
  const [view, setView] = useState<ViewType>("text");
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

  const handleUpdateNote = (data: Partial<NoteData>) => {
    setNote((prev) => ({ ...prev, ...data }));
  };

  // State for saving
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSave = async () => {
    console.log("Saving note (Overlay):", note);
    setIsSaving(true);
    setErrorMessage(null);

    try {
      // Construct CreateNoteInput from current note state
      // Validating required fields minimally here, zod will check on server
      if (!note.url) throw new Error("URL is missing");

      // Map Overlay NoteData to Contract's CreateNoteInput
      // We need to determine 'type' and 'data' based on 'mode'
      // This mapping logic should ideally be robust.

      let type: "text" | "image" | "capture" | "bookmark" = "text";
      let data: Record<string, unknown> = {};

      switch (view) {
        case "text":
          type = "text";
          data = { text: note.text || "" };
          break;
        case "image":
          type = "image";
          data = {
            image_url: note.srcUrl || "",
            alt_text: note.altText,
          };
          break;
        case "capture":
          type = "capture";
          data = {
            screenshot_url: note.captureData?.image || "",
            width: note.captureData?.area?.width || 0,
            height: note.captureData?.area?.height || 0,
          };
          break;
        case "bookmark":
          type = "bookmark";
          data = {
            title: note.title || "",
            description: note.description,
            image: note.previewImage,
            favicon: note.favicon,
            site_name: note.siteName,
          };
          break;
      }

      const input = {
        type,
        url: note.url,
        content: note.memo, // Assuming editor saves user memo here? Or maybe we need to wire it up.
        // Looking at Editor components, they usually have local state.
        // OverlayApp needs to receive 'onUpdate' correctly.
        data,
        tags: [],
      };

      await saveNote(input);

      // Success
      onClose();
      // Optional: Send success message to background to show notification?
    } catch (e: unknown) {
      console.error("Save failed:", e);
      const msg = e instanceof Error ? e.message : "Unknown error occurred";
      setErrorMessage(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fade-in slide-in-from-right-4 fixed top-4 right-4 z-50 h-[600px] w-[360px] animate-in overflow-hidden rounded-2xl border border-gray-200 bg-white font-sans text-gray-900 shadow-2xl duration-300">
      {view === "text" && (
        <TextEditor
          note={note}
          onUpdate={handleUpdateNote}
          onClose={onClose}
          onSave={handleSave}
        />
      )}
      {view === "capture" && (
        <CaptureEditor
          note={note}
          onUpdate={handleUpdateNote}
          onClose={onClose}
          onSave={handleSave}
        />
      )}
      {view === "image" && (
        <ImageEditor
          note={note}
          onUpdate={handleUpdateNote}
          onClose={onClose}
          onSave={handleSave}
        />
      )}
      {view === "bookmark" && (
        <BookmarkEditor
          note={note}
          onUpdate={handleUpdateNote}
          onClose={onClose}
          onSave={handleSave}
        />
      )}

      {/* Loading & Error Overlay */}
      {isSaving && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-green-600" />
            <span className="font-medium text-gray-600 text-sm">Saving...</span>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="slide-in-from-bottom-2 fade-in absolute right-4 bottom-4 left-4 z-50 flex animate-in items-center justify-between rounded-lg border border-red-100 bg-red-50 p-3 text-red-600 text-sm shadow-lg">
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="ml-2 font-bold text-red-400 hover:text-red-700"
          >
            ✕
          </button>

          {/* Show Connect Button if Unauthorized (basic string assumption for now) */}
          {errorMessage?.includes("Unauthorized") && (
            <a
              href="http://localhost:3000/auth/sync"
              target="_blank"
              rel="noreferrer"
              className="-translate-x-1/2 absolute bottom-16 left-1/2 whitespace-nowrap rounded-full bg-blue-600 px-4 py-2 font-medium text-sm text-white shadow hover:bg-blue-700"
            >
              Connect Account
            </a>
          )}
        </div>
      )}
    </div>
  );
}

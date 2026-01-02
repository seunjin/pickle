import { BookmarkEditor } from "@features/bookmark/components/BookmarkEditor";
import { CaptureEditor } from "@features/capture/components/CaptureEditor";
import { ImageEditor } from "@features/image/components/ImageEditor";
import { TextEditor } from "@features/text/components/TextEditor";
import type { CreateNoteInput } from "@pickle/contracts/src/note";
import { saveNote } from "@shared/api/note";
import { extensionStorage } from "@shared/lib/extension-api";
import { getNoteKey } from "@shared/storage";
import type { NoteData, ViewType } from "@shared/types";
import { useEffect, useEffectEvent, useState } from "react";

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
    (changes: { [key: string]: any }, areaName: string) => {
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
    extensionStorage.get(STORAGE_KEY, (result) => {
      if (result[STORAGE_KEY]) {
        console.log("Loaded note:", result[STORAGE_KEY]);
        const data = result[STORAGE_KEY] as NoteData;
        setNote(data);
        if (data.mode) setView(data.mode);
      }
    });

    // 2. Storage Sync (Note Data + Session Recovery)
    // useEffectEvent로 생성된 핸들러는 안정적이므로 listener 등록에 안전하게 사용 가능
    extensionStorage.onChanged.addListener(handleStorageChange);

    // 🚀 Auto-Recovery Listener: Session restored via Auth Sync
    const handleSessionRecovery = (
      changes: { [key: string]: any },
      areaName: string,
    ) => {
      if (areaName === "local" && changes.supabaseSession?.newValue) {
        console.log("Session recovered! Clearing error...");
        setErrorMessage(null);
        // Optional: Auto-retry save if it failed due to auth?
        // For now, just clearing error is enough to let user click "Save" again.
      }
    };
    extensionStorage.onChanged.addListener(handleSessionRecovery);

    return () => {
      extensionStorage.onChanged.removeListener(handleStorageChange);
      extensionStorage.onChanged.removeListener(handleSessionRecovery);
    };
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

      // Common fields
      const inputMeta = {
        url: note.url,
        favicon: note.pageMeta?.favicon, // Optional
        site_name: note.pageMeta?.site_name, // Optional
        title: note.pageMeta?.title, // Optional (or undefined)
        description: note.pageMeta?.description,
        image: note.pageMeta?.image,
      };

      const common = {
        title: note.title || note.pageMeta?.title, // [수정] 사용자가 수정한 제목을 우선순위로 저장
        meta: inputMeta, // Moved to top-level meta
        memo: note.memo,
        tags: [],
      };

      let input: CreateNoteInput;

      switch (view) {
        case "text":
          input = {
            ...common,
            type: "text",
            data: { text: note.text || "" },
          };
          break;
        case "image":
          input = {
            ...common,
            type: "image",
            data: {
              // [Transient] DB 'data' 컬럼에 저장되지 않음.
              // Background에서 이 URL을 다운로드하여 Storage에 업로드 후 'asset_id'로 변환됨.
              image_url: note.srcUrl || "",
            },
          };
          break;
        case "capture":
          input = {
            ...common,
            type: "capture",
            data: {
              // [Transient] DB 저장 X. Storage 업로드용 Base64 데이터.
              image_url: note.captureData?.image || "", // Base64 (fixed property name)
              display_width: note.captureData?.area?.width || 0,
              display_height: note.captureData?.area?.height || 0,
            },
          };
          break;
        case "bookmark":
          input = {
            ...common,
            type: "bookmark",
            data: {}, // [Refactor] Data is now empty for bookmarks (uses meta & title)
          };
          break;
        default:
          throw new Error(`Unsupported mode: ${view}`);
      }

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

  const handleRetake = async () => {
    console.log("Retake capture requested");
    // 1. 현재 오버레이 닫기 (새로운 캡쳐 영역 선택을 위해)
    onClose();

    // 2. 백그라운드에 캡쳐 시작 요청 전송
    chrome.runtime.sendMessage({ action: "RE_CAPTURE" });
  };

  return (
    <div className="h-full">
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
          onRetake={handleRetake}
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
        <div className="slide-in-from-bottom-2 fade-in absolute right-4 bottom-4 left-4 z-50 flex flex-col gap-2 rounded-lg border border-red-100 bg-red-50 p-3 text-sm shadow-lg">
          <div className="flex items-center justify-between text-red-600">
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="ml-2 px-2 font-bold text-red-400 hover:text-red-700"
            >
              ✕
            </button>
          </div>

          {/* Show Connect Button for Auth/Session/Workspace Errors */}
          {(errorMessage.includes("Unauthorized") ||
            errorMessage.includes("만료") ||
            errorMessage.includes("No Workspace")) && (
            <button
              type="button"
              onClick={() => {
                // Open new tab for auth sync using env var
                const appUrl =
                  import.meta.env.NEXT_PUBLIC_APP_URL ||
                  "http://localhost:3000";
                window.open(`${appUrl}/auth/sync`, "_blank");
              }}
              className="mt-1 w-full rounded bg-red-600 py-1.5 font-medium text-white text-xs transition-colors hover:bg-red-700"
            >
              계정 연결하기 (로그인)
            </button>
          )}
        </div>
      )}
    </div>
  );
}

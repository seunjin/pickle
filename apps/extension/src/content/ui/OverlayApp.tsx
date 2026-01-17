import { BookmarkEditor } from "@features/bookmark/components/BookmarkEditor";
import { CaptureEditor } from "@features/capture/components/CaptureEditor";
import { ImageEditor } from "@features/image/components/ImageEditor";
import { TextEditor } from "@features/text/components/TextEditor";
import type { CreateNoteInput } from "@pickle/contracts/src/note";
import { Confirm, Spinner, useDialog } from "@pickle/ui";
import { saveNote } from "@shared/api/note";
import { OverlayToast } from "@shared/components/OverlayToast";
import { extensionStorage } from "@shared/lib/extension-api";
import { getNoteKey } from "@shared/storage";
import { useToastStore } from "@shared/stores/useToastStore";
import type { NoteData, ViewType } from "@shared/types";
import { AnimatePresence } from "motion/react";
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
  const { toast, showToast, hideToast } = useToastStore();
  const dialog = useDialog();

  // Storage Key: Tab ID 기반으로 분리
  const STORAGE_KEY = getNoteKey(tabId);

  // State for saving
  const [isSaving, setIsSaving] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  // 로더 깜빡임 방지: 200ms 이상 소요될 때만 로더 표시
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (isSaving) {
      timer = setTimeout(() => setShowLoader(true), 200);
    } else {
      setShowLoader(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isSaving]);

  // Event handler that reads reactive 'view' state but remains stable
  const handleStorageChange = useEffectEvent(
    (
      changes: Record<string, chrome.storage.StorageChange>,
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
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: string,
    ) => {
      if (areaName === "local" && changes.supabaseSession?.newValue) {
        console.log("Session recovered! Clearing error...");
        dialog.closeAll(); // Close any login-related dialogs
        showToast({
          title: "로그인이 완료되었습니다.",
          kind: "success",
          durationMs: 4000,
        });
      }
    };
    extensionStorage.onChanged.addListener(handleSessionRecovery);

    return () => {
      extensionStorage.onChanged.removeListener(handleStorageChange);
      extensionStorage.onChanged.removeListener(handleSessionRecovery);
    };
  }, [STORAGE_KEY, dialog, showToast]); // handleStorageChange is stable thanks to useEffectEvent

  const handleUpdateNote = (data: Partial<NoteData>) => {
    setNote((prev) => ({ ...prev, ...data }));
  };

  const handleSave = async (finalData?: Partial<NoteData>) => {
    // Merge current state with finalData from editor (to avoid async state lag)
    const currentNote = { ...note, ...finalData };
    console.log("Saving note (Overlay):", currentNote);
    setIsSaving(true);

    try {
      // Construct CreateNoteInput from merged state
      if (!currentNote.url) throw new Error("URL is missing");

      // Common fields
      const inputMeta = {
        url: currentNote.url,
        favicon: currentNote.pageMeta?.favicon,
        site_name: currentNote.pageMeta?.site_name,
        title: currentNote.pageMeta?.title,
        description: currentNote.pageMeta?.description,
        image: currentNote.pageMeta?.image,
      };

      const common = {
        title: currentNote.title?.trim() || undefined,
        meta: inputMeta,
        memo: currentNote.memo,
        tags: [],
        blurDataUrl: currentNote.blurDataUrl,
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
              // currentNote 사용: finalData에서 전달된 크롭된 이미지 포함
              image_url: currentNote.captureData?.image || "",
              display_width: currentNote.captureData?.area?.width || 0,
              display_height: currentNote.captureData?.area?.height || 0,
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
      new BroadcastChannel("pickle_sync").postMessage({
        type: "PICKLE_NOTE_SAVED",
      });

      onClose();
    } catch (e: unknown) {
      console.error("Save failed:", e);
      const msg = e instanceof Error ? e.message : "Unknown error occurred";

      const isAuthError =
        msg.includes("Unauthorized") ||
        msg.includes("만료") ||
        msg.includes("No Workspace");

      const isStorageError = msg.includes("스토리지 용량");

      if (isAuthError) {
        dialog.open(() => (
          <Confirm
            title="로그인 필요"
            content="서비스를 이용하려면 로그인 해주세요."
            confirmButtonText="로그인하기"
            onConfirm={() => {
              chrome.runtime.sendMessage({ action: "LOGIN" }, (response) => {
                if (response?.success) {
                  showToast({
                    title: "로그인이 완료되었습니다.",
                    kind: "success",
                    durationMs: 4000,
                  });
                } else {
                  showToast({
                    title: response?.error || "로그인에 실패했습니다.",
                    kind: "error",
                    durationMs: 4000,
                  });
                }
              });
              dialog.close();
            }}
            onCancel={() => dialog.close()}
          />
        ));
      } else if (isStorageError) {
        dialog.open(() => (
          <Confirm
            title="저장용량 부족"
            content={`저장된 노트를 정리하거나\n플랜 업그레이드가 필요해요.`}
            confirmButtonText="관리하기"
            onConfirm={() => {
              const appUrl =
                import.meta.env.NEXT_PUBLIC_APP_URL ||
                "https://picklenote.vercel.app";
              chrome.runtime.sendMessage({
                action: "OPEN_TAB",
                url: `${appUrl}/dashboard`,
              });
              dialog.close();
            }}
            onCancel={() => dialog.close()}
          />
        ));
      } else {
        showToast({
          title: msg,
          kind: "error",
          durationMs: 4000,
        });
      }
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
    <div className="relative h-full overflow-hidden">
      {view === "text" && (
        <TextEditor
          note={note}
          onUpdate={handleUpdateNote}
          onClose={onClose}
          onSave={handleSave}
          isSaving={isSaving}
        />
      )}
      {view === "capture" && (
        <CaptureEditor
          note={note}
          onUpdate={handleUpdateNote}
          onClose={onClose}
          onRetake={handleRetake}
          onSave={handleSave}
          isSaving={isSaving}
        />
      )}
      {view === "image" && (
        <ImageEditor
          note={note}
          onUpdate={handleUpdateNote}
          onClose={onClose}
          onSave={handleSave}
          isSaving={isSaving}
        />
      )}
      {view === "bookmark" && (
        <BookmarkEditor
          note={note}
          onUpdate={handleUpdateNote}
          onClose={onClose}
          onSave={handleSave}
          isSaving={isSaving}
        />
      )}
      {/* Local Overlay Toast */}
      <AnimatePresence>
        {toast && <OverlayToast {...toast} onClose={hideToast} />}
      </AnimatePresence>

      {/* Loading Overlay */}
      {showLoader && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-base-dimed">
          <div className="flex flex-col items-center gap-1.5">
            <Spinner className="size-6 text-base-primary" />
            <span className="font-medium text-[14px] text-base-primary">
              저장중...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

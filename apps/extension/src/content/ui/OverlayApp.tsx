import { BookmarkEditor } from "@features/bookmark/components/BookmarkEditor";
import { CaptureEditor } from "@features/capture/components/CaptureEditor";
import { ImageEditor } from "@features/image/components/ImageEditor";
import { TextEditor } from "@features/text/components/TextEditor";
import type { CreateNoteInput } from "@pickle/contracts/src/note";
import { Confirm, Spinner, useDialog } from "@pickle/ui";
import { saveNote } from "@shared/api/note";
import { OverlayToast } from "@shared/components/OverlayToast";
import { extensionStorage } from "@shared/lib/extension-api";
import { logger } from "@shared/lib/logger";
import { getValidSession } from "@shared/lib/supabase";
import { getNoteKey } from "@shared/storage";
import { useToastStore } from "@shared/stores/useToastStore";
import type { NoteData, ViewType } from "@shared/types";
import { AnimatePresence } from "motion/react";
import { useCallback, useEffect, useEffectEvent, useState } from "react";

/**
 * OverlayApp Component
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

  const STORAGE_KEY = getNoteKey(tabId);
  const [isSaving, setIsSaving] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  const handleClose = useCallback(() => {
    // 🧹 클린업: 탭에 저장된 임시 데이터를 백그라운드 스토리지에서 제거
    chrome.runtime.sendMessage({ action: "CLEAR_NOTE", tabId });
    onClose();
  }, [tabId, onClose]);

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

  const handleStorageChange = useEffectEvent(
    (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: string,
    ) => {
      if (areaName === "local" && changes[STORAGE_KEY]) {
        const newValue = changes[STORAGE_KEY].newValue as NoteData;
        if (newValue) {
          setNote(newValue);
          if (newValue.mode && newValue.mode !== view) {
            setView(newValue.mode);
          }
        }
      }
    },
  );

  useEffect(() => {
    extensionStorage.get(STORAGE_KEY, (result) => {
      if (result[STORAGE_KEY]) {
        const data = result[STORAGE_KEY] as NoteData;
        setNote(data);
        if (data.mode) setView(data.mode);
      }
    });

    extensionStorage.onChanged.addListener(handleStorageChange);

    const handleSessionRecovery = (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: string,
    ) => {
      if (areaName === "local" && changes.supabaseSession?.newValue) {
        dialog.closeAll();
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
  }, [STORAGE_KEY, dialog, showToast]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isSaving) return;
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleClose, isSaving]);

  const handleUpdateNote = (data: Partial<NoteData>) => {
    setNote((prev) => ({ ...prev, ...data }));
  };

  const showLoginDialog = () => {
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
  };

  const handleSave = async (finalData?: Partial<NoteData>) => {
    const currentNote = { ...note, ...finalData };
    setIsSaving(true);

    try {
      const session = await getValidSession();
      if (!session) {
        showLoginDialog();
        setIsSaving(false);
        return;
      }

      if (!currentNote.url) throw new Error("URL is missing");

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
              image_url: note.srcUrl || "",
            },
          };
          break;
        case "capture":
          input = {
            ...common,
            type: "capture",
            data: {
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
            data: {},
          };
          break;
        default:
          throw new Error(`Unsupported mode: ${view}`);
      }

      // 🔄 알림 기능 제거에 따라, 저장 완료 피드백을 보장하기 위해 다시 await를 사용합니다.
      await saveNote(input);

      new BroadcastChannel("pickle_sync").postMessage({
        type: "PICKLE_NOTE_SAVED",
      });

      handleClose();
    } catch (e: unknown) {
      logger.error("Save failed", { error: e });
      const msg = e instanceof Error ? e.message : "Unknown error occurred";
      showToast({ title: msg, kind: "error" });
      setIsSaving(false);
    }
  };

  const handleRetake = async () => {
    handleClose();
    chrome.runtime.sendMessage({ action: "RE_CAPTURE" });
  };

  return (
    <div className="relative h-full overflow-hidden">
      {view === "text" && (
        <TextEditor
          note={note}
          onUpdate={handleUpdateNote}
          onClose={handleClose}
          onSave={handleSave}
          isSaving={isSaving}
        />
      )}
      {view === "capture" && (
        <CaptureEditor
          note={note}
          onUpdate={handleUpdateNote}
          onClose={handleClose}
          onRetake={handleRetake}
          onSave={handleSave}
          isSaving={isSaving}
        />
      )}
      {view === "image" && (
        <ImageEditor
          note={note}
          onUpdate={handleUpdateNote}
          onClose={handleClose}
          onSave={handleSave}
          isSaving={isSaving}
        />
      )}
      {view === "bookmark" && (
        <BookmarkEditor
          note={note}
          onUpdate={handleUpdateNote}
          onClose={handleClose}
          onSave={handleSave}
          isSaving={isSaving}
        />
      )}

      {/* 🚀 Restore AnimatePresence for smooth toast transitions */}
      <AnimatePresence>
        {toast && <OverlayToast {...toast} onClose={hideToast} />}
      </AnimatePresence>

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

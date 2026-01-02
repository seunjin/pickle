import { LoginScreen } from "@features/auth/components/LoginScreen";
import { useExtensionAuth } from "@features/auth/hooks/useExtensionAuth";
import { BookmarkEditor } from "@features/bookmark/components/BookmarkEditor";
import { CaptureEditor } from "@features/capture/components/CaptureEditor";
import { ImageEditor } from "@features/image/components/ImageEditor";
import { TextEditor } from "@features/text/components/TextEditor";
import {
  extensionRuntime,
  extensionStorage,
  extensionTabs,
} from "@shared/lib/extension-api";
import { getNoteKey } from "@shared/storage";
import type { NoteData, ViewType } from "@shared/types";
import { useEffect, useState } from "react";

function App() {
  const { session, loading: authLoading } = useExtensionAuth();
  const [view, setView] = useState<ViewType>("text");
  const [note, setNote] = useState<NoteData>({});
  const [tabId, setTabId] = useState<number | null>(null);

  // 1. Get Active Tab ID
  useEffect(() => {
    extensionTabs.getCurrentActiveTab((tab) => {
      if (tab?.id) {
        setTabId(tab.id);
      }
    });
  }, []);

  // 2. Storage synchronization
  useEffect(() => {
    if (!tabId) return;

    const storageKey = getNoteKey(tabId);

    // Initial load
    extensionStorage.get(storageKey, (result) => {
      if (result[storageKey]) {
        const data = result[storageKey] as NoteData;
        setNote(data);
        if (data.mode) {
          setView(data.mode);
        }
      }
    });

    // Change listener
    const handleStorageChange = (
      changes: { [key: string]: any },
      areaName: string,
    ) => {
      if (areaName === "local" && changes[storageKey]) {
        const newValue = changes[storageKey].newValue as NoteData;
        if (newValue) {
          setNote(newValue);
          if (newValue.mode && newValue.mode !== view) {
            setView(newValue.mode);
          }
        }
      }
    };

    extensionStorage.onChanged.addListener(handleStorageChange);
    return () => extensionStorage.onChanged.removeListener(handleStorageChange);
  }, [tabId, view]);

  const handleClose = () => extensionRuntime.closePopup();

  const handleUpdateNote = (data: Partial<NoteData>) => {
    setNote((prev) => ({ ...prev, ...data }));
  };

  const handleSave = () => {
    console.log("Saving note:", note);
    // TODO: Implement actual save logic (API call)
    extensionRuntime.closePopup();
  };

  if (!tabId || authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!session) {
    return <LoginScreen />;
  }

  return (
    <div className="h-screen w-full">
      {view === "text" && (
        <TextEditor
          note={note}
          onUpdate={handleUpdateNote}
          onClose={handleClose}
          onSave={handleSave}
        />
      )}
      {view === "capture" && (
        <CaptureEditor
          note={note}
          onUpdate={handleUpdateNote}
          onClose={handleClose}
          onRetake={() => console.log("Retake clicked (App)")}
          onSave={handleSave}
        />
      )}
      {view === "image" && (
        <ImageEditor
          note={note}
          onUpdate={handleUpdateNote}
          onClose={handleClose}
          onSave={handleSave}
        />
      )}
      {view === "bookmark" && (
        <BookmarkEditor
          note={note}
          onUpdate={handleUpdateNote}
          onClose={handleClose}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

export default App;

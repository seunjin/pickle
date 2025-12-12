import { useEffect, useState } from "react";
import "./App.css";

import { BookmarkEditor } from "@features/bookmark/components/BookmarkEditor";
import { CaptureEditor } from "@features/capture/components/CaptureEditor";
import { ImageEditor } from "@features/image/components/ImageEditor";
import { TextEditor } from "@features/text/components/TextEditor";
import { getNoteKey } from "@shared/storage";
import type { NoteData, ViewType } from "@shared/types";

function App() {
  const [view, setView] = useState<ViewType>("text");
  const [note, setNote] = useState<NoteData>({});
  const [tabId, setTabId] = useState<number | null>(null);

  // 1. Get Active Tab ID
  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        setTabId(tabs[0].id);
      }
    });
  }, []);

  // 2. Storage synchronization
  useEffect(() => {
    if (!tabId) return;

    const storageKey = getNoteKey(tabId);

    // Initial load
    chrome.storage.local.get(storageKey, (result) => {
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
      changes: { [key: string]: chrome.storage.StorageChange },
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

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, [tabId, view]);

  const handleClose = () => window.close();

  const handleUpdateNote = (data: Partial<NoteData>) => {
    setNote((prev) => ({ ...prev, ...data }));
  };

  const handleSave = () => {
    console.log("Saving note:", note);
    // TODO: Implement actual save logic (API call)
    // For now, assume it's saved and close the popup
    window.close();
  };

  if (!tabId) return null; // or loading spinner

  return (
    <div className="h-screen w-full bg-white text-gray-900">
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

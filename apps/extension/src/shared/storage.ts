import type { NoteData } from "./types";

export const getNoteKey = (tabId: number) => `note_${tabId}`;

export async function getNote(tabId: number): Promise<NoteData | null> {
  const key = getNoteKey(tabId);
  const result = await chrome.storage.local.get(key);
  return result[key] || null;
}

export async function updateNote(tabId: number, data: Partial<NoteData>) {
  const key = getNoteKey(tabId);
  const current = await getNote(tabId);

  await chrome.storage.local.set({
    [key]: {
      ...current,
      ...data,
      timestamp: Date.now(), // Always update timestamp on change
    },
  });
}

export async function setNote(tabId: number, data: NoteData) {
  const key = getNoteKey(tabId);
  await chrome.storage.local.set({
    [key]: {
      ...data,
      timestamp: data.timestamp || Date.now(),
    },
  });
}

export async function clearNote(tabId: number) {
  const key = getNoteKey(tabId);
  await chrome.storage.local.remove(key);
}

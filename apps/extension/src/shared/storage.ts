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

// [NEW] Shortcut Storage Utilities
import { getOSDefaultShortcuts, type ShortcutSettings } from "./types";

const SHORTCUTS_KEY = "user_shortcuts";
const SHORTCUTS_VERSION_KEY = "shortcuts_version";
const CURRENT_SHORTCUTS_VERSION = "1.1"; // 1.1: New OS-specific default logic (Cmd+Option for Mac, etc)

export async function getShortcuts(): Promise<ShortcutSettings> {
  const result = await chrome.storage.sync.get([
    SHORTCUTS_KEY,
    SHORTCUTS_VERSION_KEY,
  ]);
  const data = result[SHORTCUTS_KEY];
  const version = result[SHORTCUTS_VERSION_KEY];

  // 버전이 없거나 현재 버전보다 낮으면 초기화 (마이그레이션)
  if (!version || version !== CURRENT_SHORTCUTS_VERSION) {
    return resetShortcuts();
  }

  if (!data || typeof data !== "object") return getOSDefaultShortcuts();
  return data as ShortcutSettings;
}

export async function setShortcuts(shortcuts: ShortcutSettings): Promise<void> {
  await chrome.storage.sync.set({ [SHORTCUTS_KEY]: shortcuts });
}

export async function updateShortcut(
  action: string,
  keyCombo: string,
): Promise<void> {
  const current = await getShortcuts();
  await setShortcuts({
    ...current,
    [action]: keyCombo,
  });
}

export async function resetShortcuts(): Promise<ShortcutSettings> {
  const defaults = getOSDefaultShortcuts();
  await chrome.storage.sync.set({
    [SHORTCUTS_KEY]: defaults,
    [SHORTCUTS_VERSION_KEY]: CURRENT_SHORTCUTS_VERSION,
  });
  return defaults;
}

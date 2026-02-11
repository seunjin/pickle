export type ViewType = "menu" | "image" | "capture" | "text" | "bookmark";

export interface CaptureData {
  image: string; // Base64 data URL
  area: { x: number; y: number; width: number; height: number };
}

// [Refactor] Renamed from BookmarkData to PageMetadata to reflect generic usage
export interface PageMetadata {
  title: string;
  description: string;
  image: string;
  url: string;
  site_name?: string;
  favicon?: string;
}

export interface NoteData {
  text?: string;
  url?: string;
  srcUrl?: string; // For image save
  altText?: string; // [NEW] Image Alt Text
  timestamp?: number;
  mode?: ViewType;
  captureData?: CaptureData;
  pageMeta?: PageMetadata; // [Refactor] Renamed from bookmarkData
  isLoading?: boolean;
  blurDataUrl?: string; // [NEW] Low-res preview for high-quality blur

  // Fields used in OverlayApp but previously missing from type
  title?: string;
  description?: string;
  previewImage?: string;
  favicon?: string;
  siteName?: string;
  memo?: string;
}

// [NEW] Shortcut types (이미지 단축키는 패널 전용으로 제외)
export type ShortcutAction = "text" | "capture" | "bookmark";

export interface ShortcutSettings {
  [key: string]: string; // action -> key combination (e.g., "capture" -> "Ctrl+Shift+E")
}

export type OS = "mac" | "windows" | "linux" | "other";

export const getOS = (): OS => {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent.toLowerCase();

  if (/macintosh|macintel|macppc|mac68k/i.test(ua)) return "mac";
  if (/win32|win64|windows|wince/i.test(ua)) return "windows";
  if (/linux/i.test(ua)) return "linux";

  return "other";
};

export const isMac = getOS() === "mac";

export const getOSDefaultShortcuts = (): ShortcutSettings => {
  const os = getOS();

  if (os === "mac") {
    // macOS: Cmd + Option 조합 사용
    const prefix = "Cmd+Option";
    return {
      bookmark: `${prefix}+F`,
      capture: `${prefix}+E`,
      text: `${prefix}+S`,
    };
  }

  // Windows/Linux/Other: Ctrl + Shift 조합 사용 (Alt+Shift는 IME 충돌 위험)
  const prefix = "Ctrl+Shift";
  return {
    bookmark: `${prefix}+F`,
    capture: `${prefix}+E`,
    text: `${prefix}+S`,
  };
};

export const DEFAULT_SHORTCUTS: ShortcutSettings = getOSDefaultShortcuts();

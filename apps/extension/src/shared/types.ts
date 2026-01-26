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

export const isMac =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPod|iPad/.test(navigator.platform);

export const getOSDefaultShortcuts = (): ShortcutSettings => {
  // 브라우저/OS 기본 단축키(Cmd+N 등)와의 충돌을 피하기 위해
  // 익스텐션은 Alt+Shift 조합을 기본으로 사용하는 것이 Best Practice입니다.
  const prefix = "Alt+Shift";
  return {
    text: `${prefix}+S`, // Save Selection
    bookmark: `${prefix}+D`, // Done/Bookmark
    capture: `${prefix}+E`, // Capture (기존 유지)
  };
};

export const DEFAULT_SHORTCUTS: ShortcutSettings = getOSDefaultShortcuts();

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
  /Macintosh|MacIntel|MacPPC|Mac68K/i.test(navigator.userAgent);

export const getOSDefaultShortcuts = (): ShortcutSettings => {
  // Cmd+Shift+1(탭 이동), Alt+숫자(메뉴) 등 모든 충돌 가능성을 배제하기 위해
  // 익스텐션에서 가장 안전하게 쓸 수 있는 Alt+Shift + 숫자 조합을 사용합니다.
  // Mac: Option+Shift+1, Windows: Alt+Shift+1
  const prefix = isMac ? "Cmd+Shift" : "Alt+Shift";

  return {
    bookmark: `${prefix}+B`,
    capture: `${prefix}+E`,
    text: `${prefix}+D`,
  };
};

export const DEFAULT_SHORTCUTS: ShortcutSettings = getOSDefaultShortcuts();

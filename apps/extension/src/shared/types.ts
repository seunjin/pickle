export type ViewType = "menu" | "image" | "capture" | "text" | "bookmark";

export interface CaptureData {
  image: string; // Base64 data URL
  area: { x: number; y: number; width: number; height: number };
}

export interface BookmarkData {
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
  bookmarkData?: BookmarkData;
  isLoading?: boolean;

  // Fields used in OverlayApp but previously missing from type
  title?: string;
  description?: string;
  previewImage?: string;
  favicon?: string;
  siteName?: string;
  memo?: string;
}

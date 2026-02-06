/**
 * Chrome Storage 기반 Supabase Storage Adapter
 *
 * MV3 Service Worker에는 localStorage가 없으므로,
 * Supabase Auth의 PKCE code_verifier 저장을 위해
 * chrome.storage.local 기반 custom adapter를 구현합니다.
 */

import type { SupportedStorage } from "@supabase/supabase-js";
import { logger } from "./logger";

export const chromeStorageAdapter: SupportedStorage = {
  /**
   * chrome.storage.local에서 값을 가져옵니다.
   */
  getItem: async (key: string): Promise<string | null> => {
    try {
      const result = await chrome.storage.local.get(key);
      const value = result[key];
      return typeof value === "string" ? value : null;
    } catch (error) {
      logger.error("[ChromeStorageAdapter] getItem error", { error });
      return null;
    }
  },

  /**
   * chrome.storage.local에 값을 저장합니다.
   */
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await chrome.storage.local.set({ [key]: value });
    } catch (error) {
      logger.error("[ChromeStorageAdapter] setItem error", { error });
    }
  },

  /**
   * chrome.storage.local에서 값을 삭제합니다.
   */
  removeItem: async (key: string): Promise<void> => {
    try {
      await chrome.storage.local.remove(key);
    } catch (error) {
      logger.error("[ChromeStorageAdapter] removeItem error", { error });
    }
  },
};

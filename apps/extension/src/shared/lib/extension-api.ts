/**
 * Chrome Extension API를 브라우저 환경에서도 에러 없이 사용할 수 있도록 추상화한 유틸리티입니다.
 */

import { logger } from "./logger";

/**
 * 현재 익스텐션 컨텍스트가 유효한지 확인합니다.
 * 익스텐션이 재로드되면 기존 스크립트의 context는 invalidated 상태가 됩니다.
 */
export function getIsExtensionValid() {
  try {
    return (
      typeof chrome !== "undefined" &&
      typeof chrome.runtime !== "undefined" &&
      !!chrome.runtime.id
    );
  } catch (_e) {
    return false;
  }
}

// --- Storage API ---

export const extensionStorage = {
  get: (
    key: string | string[] | null,
    callback: (items: Record<string, unknown>) => void,
  ) => {
    if (getIsExtensionValid()) {
      try {
        chrome.storage.local.get(
          key,
          // biome-ignore lint/suspicious/noExplicitAny: internal mock implementation
          callback as (items: Record<string, any>) => void,
        );
      } catch (_e) {
        logger.warn(
          "[Pickle] Extension context invalidated. Please refresh the page.",
        );
      }
    } else {
      const result: Record<string, unknown> = {};
      if (typeof key === "string") {
        const value = localStorage.getItem(key);
        result[key] = value ? JSON.parse(value) : undefined;
      } else if (Array.isArray(key)) {
        for (const k of key) {
          const value = localStorage.getItem(k);
          result[k] = value ? JSON.parse(value) : undefined;
        }
      } else if (key === null) {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k) {
            const value = localStorage.getItem(k);
            result[k] = value ? JSON.parse(value) : undefined;
          }
        }
      }
      callback(result);
    }
  },
  set: <T>(items: Record<string, T>, callback?: () => void) => {
    if (getIsExtensionValid()) {
      try {
        chrome.storage.local.set(items, callback || (() => {}));
      } catch (_e) {
        logger.warn(
          "[Pickle] Extension context invalidated. Please refresh the page.",
        );
      }
    } else {
      for (const [key, value] of Object.entries(items)) {
        localStorage.setItem(key, JSON.stringify(value));
        window.dispatchEvent(
          new CustomEvent("extension-storage-changed", {
            detail: { [key]: { newValue: value } },
          }),
        );
      }
      callback?.();
    }
  },
  remove: (key: string | string[], callback?: () => void) => {
    if (getIsExtensionValid()) {
      try {
        chrome.storage.local.remove(key, callback || (() => {}));
      } catch (_e) {
        logger.warn(
          "[Pickle] Extension context invalidated. Please refresh the page.",
        );
      }
    } else {
      const keys = Array.isArray(key) ? key : [key];
      for (const k of keys) {
        localStorage.removeItem(k);
      }
      callback?.();
    }
  },
  onChanged: {
    addListener: (
      callback: (
        changes: Record<string, chrome.storage.StorageChange>,
        areaName: string,
      ) => void,
    ) => {
      if (getIsExtensionValid()) {
        try {
          chrome.storage.onChanged.addListener(callback);
        } catch (_e) {
          logger.warn("[Pickle] Extension context invalidated.");
        }
      } else {
        const handler = (
          e: Event & { detail?: Record<string, chrome.storage.StorageChange> },
        ) => {
          callback(e.detail || {}, "local");
        };
        // biome-ignore lint/suspicious/noExplicitAny: internal mock implementation
        (callback as any)._handler = handler;
        window.addEventListener("extension-storage-changed", handler);
      }
    },
    removeListener: (
      callback: (
        changes: Record<string, chrome.storage.StorageChange>,
        areaName: string,
      ) => void,
    ) => {
      if (getIsExtensionValid()) {
        try {
          chrome.storage.onChanged.removeListener(callback);
        } catch (_e) {
          logger.warn("[Pickle] Extension context invalidated.");
        }
      } else {
        // biome-ignore lint/suspicious/noExplicitAny: internal mock implementation
        const handler = (callback as any)._handler;
        if (handler) {
          window.removeEventListener("extension-storage-changed", handler);
        }
      }
    },
  },
};

// --- Tabs API ---

export const extensionTabs = {
  getCurrentActiveTab: (
    callback: (tab: { id: number; url?: string } | null) => void,
  ) => {
    if (getIsExtensionValid()) {
      try {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const tab = tabs[0];
          if (tab && typeof tab.id === "number") {
            callback({ id: tab.id, url: tab.url });
          } else {
            callback(null);
          }
        });
      } catch (_e) {
        callback(null);
      }
    } else {
      callback({ id: 99999, url: window.location.href });
    }
  },
  sendMessageToActiveTab: (
    message: unknown,
    // biome-ignore lint/suspicious/noExplicitAny: internal mock implementation
    callback?: (response: any) => void,
  ) => {
    if (getIsExtensionValid()) {
      try {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const tabId = tabs[0]?.id;
          if (typeof tabId === "number") {
            chrome.tabs.sendMessage(tabId, message, callback || (() => {}));
          } else {
            callback?.(null);
          }
        });
      } catch (_e) {
        callback?.(null);
      }
    } else {
      callback?.(null);
    }
  },
};

// --- Runtime API ---

export const extensionRuntime = {
  closePopup: () => {
    if (getIsExtensionValid()) {
      window.close();
    } else {
      logger.debug("[Mock] Extension popup would close here.");
    }
  },
  getURL: (path: string) => {
    if (getIsExtensionValid()) {
      return chrome.runtime.getURL(path);
    }
    return `/${path}`;
  },
  openTab: (url: string) => {
    if (getIsExtensionValid()) {
      chrome.tabs.create({ url });
    } else {
      window.open(url, "_blank");
    }
  },
  onMessage: {
    addListener: (
      callback: (
        message: unknown,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: unknown) => void,
      ) => undefined | boolean,
    ) => {
      if (getIsExtensionValid()) {
        try {
          chrome.runtime.onMessage.addListener(callback);
        } catch (_e) {
          logger.warn("[Pickle] Extension context invalidated.");
        }
      } else {
        const handler = (
          e: Event & {
            detail?: {
              message: unknown;
              sender: chrome.runtime.MessageSender;
              requestId?: string;
            };
          },
        ) => {
          const { message, sender } = e.detail || {
            message: undefined,
            sender: { id: "mock" } as chrome.runtime.MessageSender,
          };
          callback(message, sender, (response: unknown) => {
            const detail = e.detail;
            if (detail?.requestId) {
              window.dispatchEvent(
                new CustomEvent(
                  `extension-message-response-${detail.requestId}`,
                  {
                    detail: response,
                  },
                ),
              );
            }
          });
        };
        // biome-ignore lint/suspicious/noExplicitAny: internal mock implementation
        (callback as any)._messageHandler = handler;
        window.addEventListener("extension-on-message", handler);
      }
    },
    removeListener: (
      callback: (
        message: unknown,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: unknown) => void,
      ) => void,
    ) => {
      if (getIsExtensionValid()) {
        try {
          chrome.runtime.onMessage.removeListener(callback);
        } catch (_e) {
          logger.warn("[Pickle] Extension context invalidated.");
        }
      } else {
        // biome-ignore lint/suspicious/noExplicitAny: internal mock implementation
        const handler = (callback as any)._messageHandler;
        if (handler) {
          window.removeEventListener("extension-on-message", handler);
        }
      }
    },
  },
  sendMessage: (message: unknown, callback?: (response: unknown) => void) => {
    if (getIsExtensionValid()) {
      try {
        chrome.runtime.sendMessage(message, callback || (() => {}));
      } catch (_e) {
        logger.warn(
          "[Pickle] Extension context invalidated. Please refresh the page.",
        );
      }
    } else {
      const requestId = Math.random().toString(36).substring(7);
      if (callback) {
        const responseHandler = (e: Event & { detail?: unknown }) => {
          callback(e.detail);
          window.removeEventListener(
            `extension-message-response-${requestId}`,
            responseHandler,
          );
        };
        window.addEventListener(
          `extension-message-response-${requestId}`,
          responseHandler,
        );
      }

      window.dispatchEvent(
        new CustomEvent("extension-on-message", {
          detail: { message, sender: { id: "mock-addon" }, requestId },
        }),
      );
    }
  },
};

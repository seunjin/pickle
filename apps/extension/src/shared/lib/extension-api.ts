/**
 * Chrome Extension API를 브라우저 환경에서도 에러 없이 사용할 수 있도록 추상화한 유틸리티입니다.
 */

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
          callback as (items: Record<string, any>) => void,
        );
      } catch (_e) {
        console.warn(
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
        console.warn(
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
        console.warn(
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
        changes: Record<string, { newValue?: any; oldValue?: any }>,
        areaName: string,
      ) => void,
    ) => {
      if (getIsExtensionValid()) {
        try {
          chrome.storage.onChanged.addListener(callback as any);
        } catch (_e) {
          console.warn("[Pickle] Extension context invalidated.");
        }
      } else {
        const handler = (e: Event & { detail?: any }) => {
          callback(e.detail, "local");
        };
        (callback as any)._handler = handler;
        window.addEventListener("extension-storage-changed", handler);
      }
    },
    removeListener: (
      callback: (changes: Record<string, any>, areaName: string) => void,
    ) => {
      if (getIsExtensionValid()) {
        try {
          chrome.storage.onChanged.removeListener(callback as any);
        } catch (_e) {
          console.warn("[Pickle] Extension context invalidated.");
        }
      } else {
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
};

// --- Runtime API ---

export const extensionRuntime = {
  closePopup: () => {
    if (getIsExtensionValid()) {
      window.close();
    } else {
      console.log("[Mock] Extension popup would close here.");
    }
  },
  getURL: (path: string) => {
    if (getIsExtensionValid()) {
      return chrome.runtime.getURL(path);
    }
    return `/${path}`;
  },
  onMessage: {
    addListener: (
      callback: (
        message: any,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: any) => void,
      ) => undefined | boolean,
    ) => {
      if (getIsExtensionValid()) {
        try {
          chrome.runtime.onMessage.addListener(callback);
        } catch (_e) {
          console.warn("[Pickle] Extension context invalidated.");
        }
      } else {
        const handler = (e: Event & { detail?: any }) => {
          const { message, sender } = e.detail;
          callback(message, sender, (response) => {
            if (e.detail.requestId) {
              window.dispatchEvent(
                new CustomEvent(
                  `extension-message-response-${e.detail.requestId}`,
                  {
                    detail: response,
                  },
                ),
              );
            }
          });
        };
        (callback as any)._messageHandler = handler;
        window.addEventListener("extension-on-message", handler);
      }
    },
    removeListener: (callback: (...args: any[]) => any) => {
      if (getIsExtensionValid()) {
        try {
          chrome.runtime.onMessage.removeListener(callback);
        } catch (_e) {
          console.warn("[Pickle] Extension context invalidated.");
        }
      } else {
        const handler = (callback as any)._messageHandler;
        if (handler) {
          window.removeEventListener("extension-on-message", handler);
        }
      }
    },
  },
  sendMessage: (message: any, callback?: (response: any) => void) => {
    if (getIsExtensionValid()) {
      try {
        chrome.runtime.sendMessage(message, callback || (() => {}));
      } catch (_e) {
        console.warn(
          "[Pickle] Extension context invalidated. Please refresh the page.",
        );
      }
    } else {
      const requestId = Math.random().toString(36).substring(7);
      if (callback) {
        const responseHandler = (e: Event & { detail?: any }) => {
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

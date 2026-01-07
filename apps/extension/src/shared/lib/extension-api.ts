/**
 * Chrome Extension API를 브라우저 환경에서도 에러 없이 사용할 수 있도록 추상화한 유틸리티입니다.
 */

const isExtension =
  typeof chrome !== "undefined" && !!chrome.runtime && !!chrome.runtime.id;

// --- Storage API ---

export const extensionStorage = {
  get: (
    key: string | string[] | null,
    callback: (items: Record<string, any>) => void,
  ) => {
    if (isExtension) {
      chrome.storage.local.get(key, callback as any);
    } else {
      const result: Record<string, any> = {};
      if (typeof key === "string") {
        const value = localStorage.getItem(key);
        result[key] = value ? JSON.parse(value) : undefined;
      } else if (Array.isArray(key)) {
        for (const k of key) {
          const value = localStorage.getItem(k);
          result[k] = value ? JSON.parse(value) : undefined;
        }
      } else if (key === null) {
        // Mock: everything in localStorage (simplified)
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
  set: <T = any>(items: Record<string, T>, callback?: () => void) => {
    if (isExtension) {
      chrome.storage.local.set(items, callback || (() => {}));
    } else {
      for (const [key, value] of Object.entries(items)) {
        localStorage.setItem(key, JSON.stringify(value));
        // Mock onChanged trigger
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
    if (isExtension) {
      chrome.storage.local.remove(key, callback || (() => {}));
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
      callback: (changes: Record<string, any>, areaName: string) => void,
    ) => {
      if (isExtension) {
        chrome.storage.onChanged.addListener(callback as any);
      } else {
        const handler = (e: Event & { detail?: any }) => {
          callback(e.detail, "local");
        };
        (callback as unknown as { _handler: (e: any) => void })._handler =
          handler;
        window.addEventListener("extension-storage-changed", handler);
      }
    },
    removeListener: (
      callback: (changes: Record<string, any>, areaName: string) => void,
    ) => {
      if (isExtension) {
        chrome.storage.onChanged.removeListener(callback as any);
      } else {
        const handler = (callback as unknown as { _handler?: (e: any) => void })
          ._handler;
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
    if (isExtension) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        if (tab && typeof tab.id === "number") {
          callback({ id: tab.id, url: tab.url });
        } else {
          callback(null);
        }
      });
    } else {
      // Mock active tab in browser
      callback({ id: 99999, url: window.location.href });
    }
  },
};

// --- Runtime API ---

export const extensionRuntime = {
  closePopup: () => {
    if (isExtension) {
      window.close();
    } else {
      console.log("[Mock] Extension popup would close here.");
    }
  },
  getURL: (path: string) => {
    if (isExtension) {
      return chrome.runtime.getURL(path);
    }
    // In dev browser, assuming we serve from root or similar
    // For Vite, we might need to adjust this to point to the actual entry point
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
      if (isExtension) {
        chrome.runtime.onMessage.addListener(callback);
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
        (
          callback as unknown as { _messageHandler: (e: any) => void }
        )._messageHandler = handler;
        window.addEventListener("extension-on-message", handler);
      }
    },
    removeListener: (callback: (...args: any[]) => any) => {
      if (isExtension) {
        chrome.runtime.onMessage.removeListener(callback);
      } else {
        const handler = (
          callback as unknown as { _messageHandler?: (e: any) => void }
        )._messageHandler;
        if (handler) {
          window.removeEventListener("extension-on-message", handler);
        }
      }
    },
  },
  sendMessage: (message: any, callback?: (response: any) => void) => {
    if (isExtension) {
      chrome.runtime.sendMessage(message, callback || (() => {}));
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

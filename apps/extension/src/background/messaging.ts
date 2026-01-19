/**
 * Helper: Content Script에 안전하게 메시지를 보내는 함수입니다.
 *
 * 문제 해결(Problem Solving):
 * 익스텐션을 설치하거나 업데이트한 직후에는, 이미 열려있는 탭들에 Content Script가 주입되지 않은 상태입니다.
 * 이때 메시지를 보내면 "Receiving end does not exist" 에러가 발생합니다.
 * 이 함수는 에러 발생 시 동적으로 스크립트를 주입(Injection)하고 재시도하는 로직을 포함합니다.
 */
export async function sendMessageToContentScript(
  tabId: number,
  message: unknown,
) {
  try {
    // 1차 시도: 그냥 메시지를 보내봅니다.
    return await chrome.tabs.sendMessage(tabId, message);
  } catch (error: unknown) {
    // Content Script가 로드되지 않아서 실패한 경우를 감지합니다.
    const err = error as Error;
    if (err.message?.includes("Receiving end does not exist")) {
      try {
        // 탭 정보를 가져와 주입 가능한 페이지인지 확인합니다. (보안 정책 대응)
        const tab = await chrome.tabs.get(tabId);
        if (!tab.url || isRestrictedUrl(tab.url)) {
          console.warn(
            `Skipping script injection: Restricted URL detected (${tab.url || "unknown"})`,
          );
          throw new Error("CANNOT_INJECT_RESTRICTED_URL");
        }

        // manifest.json에서 content_scripts 파일 목록을 가져옵니다.
        const manifest = chrome.runtime.getManifest();
        const contentScripts = manifest.content_scripts?.[0]?.js;

        if (contentScripts && contentScripts.length > 0) {
          // 스크립트를 해당 탭에 강제로 주입(Execute)합니다.
          await chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: contentScripts,
          });

          await new Promise((resolve) => setTimeout(resolve, 300));
          return await chrome.tabs.sendMessage(tabId, message);
        }
      } catch (injectionError) {
        console.error("Script injection or retry failed:", injectionError);
        throw injectionError;
      }
    }
    throw error;
  }
}

/**
 * 서비스 페이지나 설정 페이지 등 스크립트 주입이 불가능한 특수 URL인지 확인합니다.
 */
function isRestrictedUrl(url: string): boolean {
  const restrictedProtocols = [
    "chrome:",
    "chrome-extension:",
    "about:",
    "edge:",
  ];
  const restrictedDomains = [
    "chrome.google.com/webstore",
    "chromewebstore.google.com",
  ];

  return (
    restrictedProtocols.some((protocol) => url.startsWith(protocol)) ||
    restrictedDomains.some((domain) => url.includes(domain))
  );
}

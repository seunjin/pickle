// Helper: Content Script 존재 여부 확인 및 주입 후 메시지 전송
export async function sendMessageToContentScript(
  tabId: number,
  message: unknown,
) {
  try {
    return await chrome.tabs.sendMessage(tabId, message);
  } catch (error: unknown) {
    // Content Script가 로드되지 않은 경우
    const err = error as Error;
    if (err.message?.includes("Receiving end does not exist")) {
      console.log(
        "Found 'Receiving end does not exist' error. Attempting injection...",
      );

      try {
        const manifest = chrome.runtime.getManifest();
        const contentScripts = manifest.content_scripts?.[0]?.js;

        if (contentScripts && contentScripts.length > 0) {
          console.log(
            `Injecting content scripts: ${contentScripts.join(", ")} into tab ${tabId}`,
          );

          await chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: contentScripts,
          });

          console.log(
            "Injection successful. Waiting for script initialization...",
          );
          await new Promise((resolve) => setTimeout(resolve, 500));

          console.log("Retrying message send...");
          const response = await chrome.tabs.sendMessage(tabId, message);
          console.log("Retry response received:", response);
          return response;
        } else {
          console.error("No content scripts found in manifest to inject.");
        }
      } catch (injectionError) {
        console.error("Script injection failed:", injectionError);
        throw injectionError; // 상위 catch로 전달
      }
    }
    throw error;
  }
}

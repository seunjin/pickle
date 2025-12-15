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
      console.log(
        "Found 'Receiving end does not exist' error. Attempting injection...",
      );

      try {
        // manifest.json에서 content_scripts 파일 목록을 가져옵니다.
        const manifest = chrome.runtime.getManifest();
        const contentScripts = manifest.content_scripts?.[0]?.js;

        if (contentScripts && contentScripts.length > 0) {
          console.log(
            `Injecting content scripts: ${contentScripts.join(", ")} into tab ${tabId}`,
          );

          // 스크립트를 해당 탭에 강제로 주입(Execute)합니다.
          await chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: contentScripts,
          });

          console.log(
            "Injection successful. Waiting for script initialization...",
          );
          // 스크립트가 실행되고 초기화될 시간을 잠깐 줍니다 (0.5초).
          await new Promise((resolve) => setTimeout(resolve, 500));

          console.log("Retrying message send...");
          // 2차 시도: 이제 스크립트가 있으니 다시 메시지를 보냅니다.
          const response = await chrome.tabs.sendMessage(tabId, message);
          console.log("Retry response received:", response);
          return response;
        } else {
          console.error("No content scripts found in manifest to inject.");
        }
      } catch (injectionError) {
        // 주입조차 실패하면 어쩔 수 없으므로 에러를 던집니다.
        console.error("Script injection failed:", injectionError);
        throw injectionError; // 상위 catch로 전달
      }
    }
    throw error;
  }
}

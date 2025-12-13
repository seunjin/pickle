console.log("Pickle Note Content Script Loaded");

// 캡쳐 및 메타데이터 요청 수신
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  console.log("Content Script Received Message:", request);

  if (request.action === "START_CAPTURE") {
    startCapture();
  } else if (request.action === "GET_METADATA") {
    try {
      const metadata = extractMetadata();
      console.log("Metadata extracted:", metadata);
      sendResponse(metadata);
    } catch (e) {
      console.error("Metadata extraction failed:", e);
      sendResponse(null);
    }
  }
});

function extractMetadata() {
  const getMeta = (property: string) =>
    document
      .querySelector(`meta[property="${property}"]`)
      ?.getAttribute("content") ||
    document.querySelector(`meta[name="${property}"]`)?.getAttribute("content");

  const getFavicon = () => {
    // 1. Try different link selectors
    const selectors = [
      "link[rel='icon']",
      "link[rel='shortcut icon']",
      "link[rel='apple-touch-icon']",
    ];

    for (const selector of selectors) {
      const link = document.querySelector(selector) as HTMLLinkElement;
      if (link?.href) {
        return link.href; // href is absolute
      }
    }

    // 2. Fallback to default /favicon.ico (Check if it exists can't be done easily synchronously, so we allow it or try google)
    // 3. Ultimate Fallback: Google S2 Service
    return `https://www.google.com/s2/favicons?domain=${window.location.hostname}&sz=64`;
  };

  return {
    title: getMeta("og:title") || getMeta("twitter:title") || document.title,
    description:
      getMeta("og:description") ||
      getMeta("twitter:description") ||
      getMeta("description") ||
      "",
    image: getMeta("og:image") || getMeta("twitter:image") || "",
    site_name: getMeta("og:site_name") || window.location.hostname,
    favicon: getFavicon(),
    url: window.location.href,
  };
}

function startCapture() {
  document.body.style.cursor = "crosshair";

  // Overlay 생성
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
  overlay.style.zIndex = "999999";
  overlay.id = "pickle-capture-overlay";
  document.body.appendChild(overlay);

  // Selection Box 생성
  const selectionBox = document.createElement("div");
  selectionBox.style.position = "fixed";
  selectionBox.style.border = "2px solid #22c55e"; // Green color
  selectionBox.style.backgroundColor = "rgba(34, 197, 94, 0.1)";
  selectionBox.style.zIndex = "1000000";
  selectionBox.style.display = "none";
  document.body.appendChild(selectionBox);

  let startX = 0;
  let startY = 0;
  let isDragging = false;

  const onMouseDown = (e: MouseEvent) => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;

    selectionBox.style.left = `${startX}px`;
    selectionBox.style.top = `${startY}px`;
    selectionBox.style.width = "0px";
    selectionBox.style.height = "0px";
    selectionBox.style.display = "block";

    e.preventDefault();
    e.stopPropagation();
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const currentX = e.clientX;
    const currentY = e.clientY;

    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);
    const left = Math.min(startX, currentX);
    const top = Math.min(startY, currentY);

    selectionBox.style.width = `${width}px`;
    selectionBox.style.height = `${height}px`;
    selectionBox.style.left = `${left}px`;
    selectionBox.style.top = `${top}px`;

    e.preventDefault();
    e.stopPropagation();
  };

  const onMouseUp = () => {
    if (!isDragging) return;
    isDragging = false;

    const rect = selectionBox.getBoundingClientRect();

    // 정리
    document.body.removeChild(overlay);
    document.body.removeChild(selectionBox);
    document.body.style.cursor = "default";

    // 이벤트 리스너 제거
    overlay.removeEventListener("mousedown", onMouseDown);
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);

    // 너무 작은 영역(실수 클릭) 무시
    if (rect.width < 10 || rect.height < 10) {
      console.log("Capture area too small, ignoring.");
      return;
    }

    // 화면이 업데이트(Overlay 제거)된 후 메시지 전송
    // requestAnimationFrame을 두 번 호출하여 확실하게 페인트 이후에 실행되도록 함
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        chrome.runtime.sendMessage({
          action: "CAPTURE_AREA",
          area: {
            x: rect.x * window.devicePixelRatio,
            y: rect.y * window.devicePixelRatio,
            width: rect.width * window.devicePixelRatio,
            height: rect.height * window.devicePixelRatio,
          },
          pageUrl: window.location.href,
          timestamp: Date.now(),
        });
      });
    });
  };

  // 이벤트 등록
  overlay.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
}

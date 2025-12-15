# Chrome Extension UI 격리 가이드 (UI Isolation Guide) - Iframe Architecture

확장 프로그램이 웹사이트의 UI를 깨뜨리거나, 반대로 웹사이트의 스타일(폰트 크기, 변환 등)에 의해 확장 프로그램 UI가 망가지는 현상을 방지하기 위한 가이드입니다.

Shadow DOM만으로는 완벽한 격리(특히 REM 단위 및 부모 Transform 영향)가 어렵기 때문에, **Iframe Architecture**를 사용합니다.

## 1. 문제 정의 (Why Iframe?)

### Shadow DOM의 한계
1.  **REM 단위 상속**: Shadow DOM 내부라도 `rem` 단위는 `<html>`의 `font-size`를 따릅니다.
    *   예: 네이버 등 `html { font-size: 10px }`인 사이트에서는 Tailwind 기본(`1rem = 16px`) UI가 매우 작게 렌더링됩니다.
2.  **부모 스타일 영향**: `body`에 `transform: scale(0.8)`이나 `filter: grayscale(1)` 등이 걸려 있으면, `fixed`로 띄운 Shadow Host도 영향을 받습니다.

### ✅ 해결책: Iframe 격리
*   **Iframe**은 별도의 `window`와 `document`를 가집니다.
*   부모 페이지의 CSS, 폰트 설정, 변형 효과로부터 **100% 독립적**입니다.
*   TailwindCSS의 Global Reset을 마음껏 사용할 수 있습니다.

---

## 2. 아키텍처 구조 (Architecture Overview)

### 📂 폴더 구조

```text
apps/extension/src/
├── overlay/              # 격리된 Iframe 환경
│   ├── index.html        # Iframe Host HTML (투명 배경)
│   └── index.tsx         # React Entry Point (기존 OverlayApp 로드)
├── content/
│   └── ui/
│       └── mount.tsx     # Iframe 주입 로직 (Content Script)
└── shared/
    └── layout.ts         # 공통 사이즈 상수 (width, height)
```

### 🧩 데이터 흐름
1.  **Background**: 단축키/메뉴 클릭 시 `OPEN_OVERLAY` 메시지 전송.
2.  **Content Script (`mount.tsx`)**:
    *   `src/overlay/index.html`을 가리키는 `<iframe>` 생성.
    *   `document.documentElement`에 append.
    *   Iframe 크기와 위치를 지정.
3.  **Iframe (`overlay/index.tsx`)**:
    *   독립된 환경에서 React App (`OverlayApp`) 실행.
    *   안전하게 전역 CSS (`index.css`) 사용 가능.

---

## 3. 구현 핵심 포인트

### A. Manifest 설정 (`manifest.json`)
Iframe으로 로드하려면 해당 HTML이 `web_accessible_resources`에 등록되어 있어야 합니다.

```json
"web_accessible_resources": [
  {
    "resources": ["src/overlay/index.html"],
    "matches": ["<all_urls>"]
  }
]
```

### B. Vite 빌드 설정 (`vite.config.ts`)
HTML 파일을 빌드 엔트리로 추가해야 합니다.

```ts
build: {
  rollupOptions: {
    input: {
      overlay: path.resolve(__dirname, "src/overlay/index.html"),
    },
  },
}
```

### C. 클릭 통과 처리 (Click-through)
Iframe이 화면의 일부만 덮도록 하거나, 투명 영역 클릭을 처리해야 합니다.
현재 구현은 **위젯 크기만큼만 Iframe을 리사이징**하여 나머지 영역의 상호작용을 보장합니다.

```tsx
// src/shared/layout.ts
export const OVERLAY_DIMENSIONS = {
  width: 360,
  height: 600,
  margin: 16,
};

// mount.tsx
iframe.style.width = `${OVERLAY_DIMENSIONS.width + buffer}px`; // 위젯 크기만큼만 할당
```

---

## 4. 최종 체크리스트 (Checklist)

- [ ] **Iframe 사용**: UI가 복잡하거나 스타일 격리가 중요하다면 Shadow DOM 대신 Iframe을 사용했는가?
- [ ] **Manifest 등록**: HTML 파일이 web accessible 리소스에 있는가?
- [ ] **빌드 엔트리**: `vite.config.ts`에 HTML 파일이 input으로 잡혀있는가?
- [ ] **사이즈 관리**: Iframe 크기가 콘텐츠를 가리지 않도록 적절히 제어되는가?

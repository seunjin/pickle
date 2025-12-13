# Chrome Extension 아키텍처 가이드 (FSD-lite)

`apps/extension`은 웹과 유사한 **FSD-lite** 아키텍처를 따르지만, 크롬 익스텐션의 특성(Multi-entry)을 반영하여 **Flat Entry** 구조를 가집니다.

## 1. 폴더 구조 (Folder Structure)

3개의 독립적인 진입점(`background`, `content`, `sidepanel`)이 `src` 최상위에 위치합니다.

```bash
apps/extension/src/
├── background/           # [Entry] Service Worker
│   └── index.ts          # 백그라운드 스크립트 진입점
│
├── content/              # [Entry] Content Script & UI
│   ├── index.ts          # 컨텐츠 스크립트 진입점
│   └── ui/               # Overlay UI (React Mount)
│
├── features/             # [FSD] 기능별 슬라이스 (Business Logic)
│   ├── auth/             # 로그인, 세션
│   ├── capture/          # 화면 캡처
│   └── notes/            # 노트 작성
│
├── shared/               # [FSD] 공통 유틸리티
│   ├── ui/               # 공용 UI 컴포넌트
│   └── lib/              # 공용 헬퍼 함수
│
├── App.tsx               # [Entry] Main Sidepanel UI
├── main.tsx              # React Entry Point
└── index.css             # Global Styles
```

## 2. 계층별 역할 (Roles)

### 🚀 Entry Points
익스텐션의 실행 주체들입니다. 서로 다른 프로세스/컨텍스트에서 실행됩니다.
*   **Background**: 브라우저 이벤트 리스닝, 메시지 중계. DOM 접근 불가.
*   **Content**: 웹페이지에 삽입되어 실행. DOM 접근 가능. Overlay UI 마운트.
*   **Main UI (Sidepanel)**: 사이드패널에서 실행되는 리액트 앱.

### 🧩 Features Layer (`src/features`)
사용자 기능 단위로 코드를 응집시킵니다.
*   모든 Entry Point에서 재사용될 수 있습니다. (예: `auth` 로직은 Background와 Sidepanel 모두 필요)
*   **주의**: `ui` 컴포넌트는 Sidepanel이나 Content Overlay에서만 사용 가능합니다.

### 🛠 Shared Layer (`src/shared`)
특정 기능에 종속되지 않는 범용 코드입니다.
*   `@pickle/ui`를 래핑한 디자인 시스템 컴포넌트 등.

## 3. 데이터 통신 (Data Flow)

*   **Message Passing**: `Background` <-> `Content` <-> `Sidepanel` 간 통신은 `chrome.runtime.sendMessage`를 사용합니다.
*   **Supabase 접근**: 보안상 **Sidepanel** 또는 **Background**에서(혹은 이를 경유하여) HTTP API로 접근하는 것을 권장합니다. (직접 DB 접속 금지 규칙 준수)

# 익스텐션 아키텍처 및 통합 가이드

## 1. 인증 동기화 (Auth Sync)
웹 애플리케이션(Supabase)과 크롬 익스텐션 간의 로그인 세션을 공유하기 위해 "브리지 페이지(Bridge Page)" 패턴을 사용합니다.

### 동작 흐름
1. **사용자 액션**: 익스텐션에서 "Connect Account" 클릭 또는 `/auth/sync` 페이지 직접 방문.
2. **웹 앱 (`/auth/sync`)**:
   - 현재 활성화된 Supabase 세션을 확인합니다.
   - `window.postMessage({ type: "PICKLE_SYNC_SESSION", session }, "*")`를 통해 세션 정보를 브로드캐스트합니다.
3. **익스텐션 (`content/index.ts`)**:
   - `/auth/sync` 페이지에 주입된 Content Script가 메시지를 수신합니다.
   - 수신한 세션 식별자(`PICKLE_SYNC_SESSION`)를 확인하고 `chrome.storage.local`에 저장합니다.
4. **익스텐션 (`background/index.ts`)**:
   - API 호출 시 `chrome.storage.local`에서 `access_token`을 꺼내 인증 헤더에 추가합니다.

## 2. 데이터 접근 (Direct DB Access via Background)
웹과 동일하게 **Supabase DB에 직접 접근**합니다. 단, 보안과 세션 관리를 위해 모든 쓰기(Write) 작업은 **Background Service Worker**에서 수행합니다.

### 동작 흐름
1. **UI (`OverlayApp.tsx`)**: 
   - 사용자가 저장 버튼을 누르면 메시지를 전송합니다: `chrome.runtime.sendMessage({ action: "SAVE_NOTE", note })`.
2. **Background (`background/index.ts`)**:
   - `SAVE_NOTE` 메시지를 수신합니다.
   - `chrome.storage.local`에서 동기화된 `access_token`을 조회합니다.
   - `supabase-js` 클라이언트를 초기화하여 직접 `insert` 쿼리를 실행합니다.
   - **RLS (Row Level Security)** 정책에 의해 데이터 접근 권한이 제어됩니다.

> **이유**: `api/internal` 같은 중간 레이어를 제거하여 아키텍처를 단순화하고, `supabase-js`의 이점(타입, DX)을 그대로 활용합니다.


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

## 2. 네트워크 요청 (Background Proxy)
HTTPS 사이트에서 Localhost(HTTP)로 요청을 보낼 때 발생하는 **Mixed Content** 차단 문제를 해결하고, CORS를 엄격하게 관리하기 위해 모든 쓰기(Write) API 요청은 Background Service Worker를 통해 대리 수행(Proxy)합니다.

### 동작 흐름
1. **UI (`OverlayApp.tsx`)**: 
   - 직접 `fetch`하지 않고 메시지를 전송합니다: `chrome.runtime.sendMessage({ action: "SAVE_NOTE", note })`.
2. **Background (`background/index.ts`)**:
   - `SAVE_NOTE` 메시지를 수신합니다.
   - 스토리지에서 `access_token`을 조회합니다.
   - `fetch`를 사용하여 `http://localhost:3000/api/internal/notes`로 실제 요청을 보냅니다.
   - 결과를 UI로 반환합니다.

> **이유**: Manifest V3 익스텐션의 Service Worker는 페이지의 콘텐츠 보안 정책(CSP)이나 Mixed Content 제약에서 비교적 자유롭기 때문에, 사용자가 `https://google.com`에 있어도 `http://localhost` 서버와 통신할 수 있습니다.


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

## 3. 메타데이터 추출 (Metadata Extraction)
캡처, 북마크 등 모든 모드에서 페이지 메타데이터(`PageMetadata`: 제목, 파비콘, OG 태그 등)를 수집하여 저장합니다.

### 캡처 모드 흐름
1. **캡처 수행**: `chrome.tabs.captureVisibleTab`으로 스크린샷 생성.
2. **이미지 업로드**: Supabase Storage에 업로드하고 `Asset` 생성.
3. **메타데이터 추출**: `GET_METADATA` 메시지를 Content Script로 전송하여 현재 페이지의 정보를 긁어옵니다. (기존에는 캡처 시 URL만 저장되는 문제가 있었으나 수정됨)
4. **통합 저장**: 이미지 정보(`data`)와 페이지 정보(`pageMeta`)를 합쳐 `notes` 테이블에 저장합니다.


## 4. 데이터 실시간 동기화 (Data Sync)
익스텐션에서 저장한 데이터가 이미 열려 있는 웹 앱 탭에 즉시 반영되도록 `BroadcastChannel` 기반의 동기화 시스템을 사용합니다.

### 동작 흐름
1. **신호 발송 (`OverlayApp.tsx`)**: 데이터 저장 성공 시 `pickle_sync` 채널로 메시지를 보냅니다.
   ```typescript
   new BroadcastChannel("pickle_sync").postMessage({ type: "PICKLE_NOTE_SAVED" });
   ```
2. **신호 수신 (`useSyncNoteList.ts`)**: 웹 앱의 활성화된 모든 탭이 메시지를 수신합니다.
3. **데이터 갱신**: 메시지 수신 시 React Query의 관련 키를 무효화(`invalidateQueries`)하여 서버에서 최신 데이터를 즉시 가져옵니다.

> **장점**: 동일 브라우저 내에서는 Supabase Realtime 없이도 "앱 같은" 실시간 UX를 제공하며 서버 비용을 절감합니다. 

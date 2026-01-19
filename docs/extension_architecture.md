# 익스텐션 아키텍처 및 통합 가이드

## 1. 인증 플로우 (Auth Flow)
크롬 익스텐션은 `chrome.identity.launchWebAuthFlow`를 사용하여 Google OAuth 로그인을 직접 처리합니다.

### 동작 흐름
1. **사용자 액션**: 익스텐션(팝업 또는 설정)에서 "로그인" 버튼 클릭.
2. **Background (`background/auth.ts`)**:
   - Supabase OAuth URL을 생성하고 PKCE 코드 챌린지를 준비합니다.
   - `chrome.identity.launchWebAuthFlow`를 호출하여 로그인 위젯을 띄웁니다.
3. **인증 완료**:
   - 리다이렉트 URL에서 인증 코드를 추출하여 Supabase 세션으로 교환합니다.
   - 획득한 세션(Access/Refresh Token)을 `chrome.storage.local`에 저장합니다.
4. **API 호출**:
   - `background/index.ts`를 통해 Supabase DB에 직접 접근하며, RLS 정책에 따라 권한이 제어됩니다.

> [!NOTE]
> 상세한 인증 및 세션 갱신 로직은 [extension_auth_flow.md](./extension_auth_flow.md)를 참고하세요.

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

## 3. 에셋 및 이미지 처리 파이프라인 (Asset Pipeline)
이미지 및 캡처 저장 시, 익스텐션 백그라운드는 데이터 무결성과 성능을 위해 특정 처리 과정을 거칩니다.

### 동작 흐름
1. **데이터 획득**: 
   - 캡처: `chrome.tabs.captureVisibleTab` (Base64)
   - 이미지: 우클릭한 이미지의 `srcUrl` (Remote URL)
2. **바이너리 변환 (Background)**:
   - `fetch`를 통해 이미지 데이터를 `Blob`으로 변환합니다.
   - `createImageBitmap`을 사용하여 이미지의 실제 해상도(Width/Height)를 추출합니다.
   - 이 과정에서 스토리지 용량 체크를 위한 `fileSize`를 미리 확보합니다.
3. **용량 검증**:
   - `get_workspace_storage_info` RPC를 통해 현재 사용량과 새로운 이미지 크기를 합산하여 워크스페이스 한도를 체크합니다.
4. **업로드 및 에셋 등록**:
   - Supabase Storage (`bitmaps` 버킷)에 파일을 업로드합니다.
   - `assets` 테이블에 메타데이터(경로, 크기, 해상도 등)를 기록하고 `asset_id`를 생성합니다.
5. **노트 연동**:
   - 생성된 `asset_id`를 `notes` 테이블의 외래키로 연결하여 최종 저장합니다.

> [!TIP]
> 백그라운드에서 모든 바이너리 처리를 수행함으로써 콘텐츠 스크립트의 부하를 줄이고, 네트워크 지연 시간 동안 사용자에게 즉각적인 로딩 상태를 제공할 수 있습니다.

## 4. 메타데이터 추출 (Metadata Extraction)
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

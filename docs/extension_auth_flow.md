# Extension 인증 시스템 및 세션 생명주기 (Auth Architecture)

본 문서는 Pickle 크롬 익스텐션의 인증 메커니즘, OAuth 플로우, 그리고 웹 브라우저 환경에서의 세션 동기화 전략을 상세히 기술합니다.

---

## 1. 인증 설계 원칙 (Design Principles)

Pickle 익스텐션의 인증 시스템은 다음과 같은 수석 엔지니어링 원칙 하에 설계되었습니다:

1.  **독립적 주체 인증 (Native Auth)**: 별도의 웹 브리지 없이 `chrome.identity.launchWebAuthFlow`를 통해 익스텐션 자체적으로 OAuth 플로우를 완결합니다.
2.  **보안 강화된 PKCE**: MV3 Service Worker의 `localStorage` 제약을 극복하기 위해 `chrome.storage.local`을 백엔드로 하는 커스텀 스토리지 어댑터를 구현하여 PKCE(Proof Key for Code Exchange)를 지원합니다.
3.  **지연 없는 세션 전파 (Web-Ext Sync)**: 익스텐션에서 획득한 세션을 웹 애플리케이션(`apps/web`)으로 즉각 전파하여 사용자에게 통합된 경험을 제공합니다.
4.  **강력한 타입 안전성**: `SupabaseClient<Database>`와 구체적인 세션 인터페이스를 사용하여 런타임 캐스팅 에러를 방지합니다.

---

## 2. OAuth & 세션 갱신 아키텍처

### 인증 시퀀스
익스텐션 백그라운드는 수명이 짧은 Access Token의 한계를 극복하기 위해 **Silent Refresh** 패턴을 채택합니다.

```mermaid
sequenceDiagram
    participant User
    participant Ext as Extension (Background)
    participant Chrome as chrome.identity API
    participant Supabase as Supabase OAuth

    User->>Ext: 로그인 시도 (LOGIN 메시지)
    Ext->>Supabase: OAuth URL 생성 & PKCE 챌린지 준비
    Ext->>Chrome: launchWebAuthFlow 실행
    Chrome->>User: 로그인 팝업 노출
    User->>Chrome: 인증 완료
    Chrome-->>Ext: Redirect URL (with code)
    Ext->>Supabase: 코드-세션 교환 (exchangeCodeForSession)
    Supabase-->>Ext: Session (JWT + Refresh Token)
    Ext->>Ext: chrome.storage.local에 영구 저장
    Ext-->>User: 로그인 완료 피드백
```

### 세션 검증 알고리즘
데이터 요청 시마다 `getValidSession()`을 호출하여 토큰의 유효성을 선제적으로 검사합니다.
- **만료 5분 전 감지**: 토큰 만료가 5분 이내로 다가오면 백그라운드에서 자동으로 `refreshSession()`을 수행하여 애플리케이션 중단을 방지합니다.
- **PGRST301 대응**: 예상치 못한 JWT 만료 에러 발생 시, 즉각적인 재시도(Retry) 로직을 통해 저장 실패를 최소화합니다.

---

## 3. 확장 프로그램 메시징 API (Auth & Core)

Background Service Worker는 모든 데이터 및 인증 요청의 중앙 게이트웨이 역할을 수행합니다.

| Action (Message) | 설명 | 응답 페이로드 |
|:---|:---|:---|
| `LOGIN` | 구글 OAuth 흐름 시작 | `{ success, session }` |
| `LOGOUT` | 로컬 세션 클리어 및 로그아웃 | `{ success }` |
| `GET_SESSION` | 유효한 현재 세션 반환 (필요시 갱신) | `{ success, session }` |
| `IS_LOGGED_IN` | 인증 상태 불리언 체크 | `{ success, loggedIn }` |
| `SAVE_NOTE` | 백그라운드 DB 직접 쓰기 (RLS 적용) | `{ success, error? }` |
| `RUN_*_FLOW` | 단축키 트리거 기반 저장 프로세스 실행 | `{ success, tabId }` |

---

## 4. Extension → Client 세션 동기화 (Session Sync Strategy)

사용자가 익스텐션에서 로그인했을 때 Client 앱(`app.pic-kle.io`)도 자동으로 로그인되도록 하는 **Hash Fragment 기반 토큰 전달** 방식을 사용합니다.

- **Sync 방식**: Extension 로그인 성공 → `app.pic-kle.io/auth/extension-sync#access_token=...&refresh_token=...` 탭 자동 오픈
- **동작 원리**:
  1. Extension이 OAuth 성공 후 `syncSessionToClient()` 호출
  2. Client 앱의 `/auth/extension-sync` 라우트가 hash에서 토큰 추출
  3. `supabase.auth.setSession()`으로 세션 설정
  4. URL hash에서 토큰 제거 후 대시보드(`/`)로 리다이렉트
- **보안 에스에이**: Hash fragment(`#`)는 서버로 전송되지 않아 접근 로그에 남지 않습니다.

```mermaid
sequenceDiagram
    participant User
    participant Ext as Extension (Background)
    participant Client as Client App (app.pic-kle.io)

    User->>Ext: 로그인 (Google OAuth)
    Ext->>Ext: chrome.identity → Supabase 세션 획득
    Ext->>Ext: chrome.storage.local에 세션 저장
    Ext->>Client: chrome.tabs.create("app.pic-kle.io/auth/extension-sync#tokens")
    Client->>Client: hash에서 토큰 추출 + URL hash 제거
    Client->>Client: supabase.auth.setSession(tokens)
    Client->>Client: /dashboard로 리다이렉트
```

---

## 5. 보안 수칙 (Security Guidelines)

- **Sensitive Data Storage**: 사용자 세션은 반드시 `sync`가 아닌 `local` 스토리지(`chrome.storage.local`)에 저장하여 외부 동기화 위협을 차단합니다.
- **Token Exposure Prevention**: 세션 동기화 시 hash fragment(`#`)를 사용하여 토큰이 서버 로그에 남지 않도록 하고, client에서 토큰 추출 후 즉시 URL hash를 제거합니다.
- **Serialization Safety**: `safeSendMessage`를 통해 전달되는 모든 인증 정보는 불변성(Immutability)을 보장하기 위해 직렬화 검증을 거칩니다.
- **RLS Enforced**: 모든 DB 직접 호출은 Supabase RLS에 의존하며, Anon Key가 탈취되더라도 타인의 데이터에 접근할 수 없도록 스키마 수준에서 방어합니다.

---

## 6. 관련 기술 가이드

- [Extension Architecture](./extension_architecture.md) - 전체적인 구조 및 iFrame 대응 전략
- [Data Access Layer](./data_access_layer.md) - 백그라운드 데이터 처리 정책

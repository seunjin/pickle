# 데이터 접근 계층 (DAL) 및 아키텍처 가이드

이 문서는 **Supabase 기반의 직접 연결(Direct Connect)** 아키텍처를 따르는 우리 프로젝트의 데이터 접근 방식을 정의합니다.
기존의 REST API 경유 방식(Next.js API Route)을 지양하고, 클라이언트(Web, Extension)가 BaaS(Backend-as-a-Service)의 이점을 최대한 활용하는 것을 목표로 합니다.

## 1. 핵심 철학 (Core Philosophy)

1.  **Supabase First**: 데이터베이스는 단순한 저장소가 아니라, **권한(RLS)과 로직(Triggers)을 가진 백엔드**입니다.
2.  **No Middleman**: 단순 CRUD 작업을 위해 불필요한 API Route(Middleman)를 두지 않습니다.
3.  **Client-Side logic**: 데이터 페칭과 변형(Mutation)은 클라이언트(React Query, Background Script)에서 직접 수행합니다.

---

## 2. 아키텍처 구조 (Architecture)

### 2.1 Web Application (`apps/web`)

웹 애플리케이션은 **React Query**와 **Supabase Client**를 조합하여 데이터를 관리합니다.

*   **Fetching**: Server Component 혹은 Client Component(`useQuery`)에서 `supabase-js`를 통해 직접 데이터를 요청합니다.
*   **Mutation**: `useMutation` 훅 내부에서 `supabase-js`를 호출하여 데이터를 쓰고, 성공 시 쿼리를 무효화(Invalidate)합니다.
*   **API Route 사용 금지**: `app/api/internal/*`과 같은 내부용 API Route는 만들지 않습니다. (Auth Callback 등 특수 목적 제외)

**예시 (`useNote.ts`):**

```typescript
// ✅ Good: 직접 Supabase 호출
const createNote = async (note: NoteInsert) => {
  const { data, error } = await supabase.from('notes').insert(note);
  if (error) throw error;
  return data;
};

// ❌ Bad: API Route 경유
const createNote = async (note) => {
  await fetch('/api/internal/notes', { ... });
};
```

### 2.2 Chrome Extension (`apps/extension`)

익스텐션은 웹보다 파편화된 환경(Multiple Frames, Service Worker Life-cycle)을 다루기 위해 **백그라운드 조정자(Background Orchestrator)** 모델을 사용합니다.

*   **Background Orchestration**: 단순히 DB에 요청을 보내는 것을 넘어, `startCaptureFlow`, `startBookmarkFlow` 등 복잡한 비즈니스 로직의 시퀀스를 관리합니다. 
*   **State Caching (`tabHoverCache`)**: `iframe` 간의 물리적 격리를 극복하기 위해, 사용자의 마우스 호버 상태 등 휘발성 데이터를 백그라운드 메모리에 캐싱하여 실시간으로 프레임 간 컨텍스트를 동기화합니다.
*   **Communication Safety**: 익스텐션의 세션 유효성 검증과 데이터 직렬화(Serialization) 안정성을 확보하기 위해 `safeSendMessage` 유틸리티를 통한 방어적 통신을 수행합니다.
*   **Direct DB Access**: 보안이 보장된 백그라운드 환경에서 `supabase-js`를 초기화하고, RLS 권한 하에 직접 DB 쓰기 작업을 수행하여 웹 애플리케이션과의 데이터 정합성을 유지합니다.

---

## 3. 보안 및 권한 모델 (Security & Authorization)

클라이언트가 DB에 직접 접근하므로, 보안의 핵심은 **데이터베이스 계층(RLS)**에 위치합니다.

1.  **인증 (Authentication)**:
    - **Web**: Supabase Auth 쿠키 기반 세션 유지.
    - **Extension**: PKCE 플로우로 획득한 토큰을 `chrome.storage.local`에 보관하고, 요청 헤더에 자동으로 주입하여 인증된 세션을 형성합니다.
2.  **인가 (Authorization - RLS)**:
    - 모든 테이블에 `auth.uid() = user_id` 정책을 적용하여 "내 데이터만 제어 가능" 원칙을 물리적으로 강제합니다.
    - 민감한 워크스페이스 관리 로직은 RPC(Remote Procedure Call)를 통해 서버 사이드에서 검증 후 처리합니다.

---

## 4. 데이터 흐름 요약 (Data Flow Matrix)

| 구분 | 흐름 (Flow) | 보안 통제 (Security) |
| :--- | :--- | :--- |
| **Web App** | Client -> Supabase Client -> DB | Browser Session + RLS |
| **Extension** | Content Script -> Background -> DB | Ext. Storage + RLS + Safe Messaging |
| **Assets/Binary** | Background -> Storage -> Meta DB | Workspace Limit RPC + RLS |

> **Tech Lead's Note**: 복잡한 서버 사이드 비즈니스 로직(결제 처리, 대량 데이터 가공)이 필요한 경우에만 Edge Functions를 사용하며, 그 외 모든 일반 데이터 처리는 **직접 연결**을 원칙으로 하여 아키텍처 복잡도를 최소화합니다.

---

## 5. 데이터 계약 (Contracts via Zod)

DB 스키마와 클라이언트 코드 간의 일관성을 보장하기 위해 `packages/contracts` 패키지를 사용합니다.

- **Schema Sharing**: DB 테이블 구조(`Database` 타입)와 애플리케이션 모델(`Note` 타입)을 공유합니다.
- **Zero-Overhead Parsing**: `transform` 로직을 제거하여 DB에서 조회한 데이터를 그대로 UI에서 사용할 수 있도록 스키마를 설계했습니다.
    - 예: `note.meta.favicon`에 직접 접근 (변환 레이어 없음)
- **Validation**: `saveNote.ts` 등에서 데이터 저장 전 `zod` 스키마를 통해 유효성을 검증합니다.

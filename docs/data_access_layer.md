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

익스텐션 또한 **독립적인 클라이언트**로서 Supabase와 직접 통신합니다.

*   **Background Script**: `packages/extension/src/background/index.ts`에서 Supabase Client를 초기화하고 DB에 직접 접근합니다.
*   **Service Worker**: Manifest V3 환경에서도 `supabase-js`는 정상 작동합니다. (단, `localStorage` 대신 `chrome.storage` 사용 등의 어댑터 설정 필요 가능성 있음)
*   **Environment**: API URL과 Anon Key는 빌드 타임에 주입되거나 설정 파일로 관리합니다.

---

## 3. 보안 모델 (Security Model)

클라이언트가 DB에 직접 접근하므로, **보안은 애플리케이션 코드가 아닌 데이터베이스 계층(RLS)에서 담당**합니다.

1.  **Authentication (인증)**:
    *   Web: Supabase Auth Cookie 세션
    *   Extension: Web에서 동기화된 `access_token`을 사용하여 인증된 요청 수행
2.  **Authorization (인가)**:
    *   **RLS (Row Level Security)** 정책을 통해 "내 데이터만 볼 수 있음", "내 데이터만 쓸 수 있음"을 엄격히 강제합니다.
    *   예: `auth.uid() = user_id`

---

## 4. 데이터 흐름 요약

| 구분 | 기존 방식 (Legacy) | **변경 후 (New Standard)** |
| :--- | :--- | :--- |
| **Web Read/Write** | Client -> API Route -> DB | **Client -> DB (Direct)** |
| **Extension Write** | Extension -> Web API -> DB | **Extension -> DB (Direct)** |
| **Security** | API Route에서 검증 | **DB RLS에서 검증** |

> **주의**: 복잡한 서버 사이드 로직(예: 결제 처리, 민감정보 가공)이 필요한 경우에만 제한적으로 `features/*/api` 내부의 Server Actions나 Supabase Edge Functions를 사용합니다.

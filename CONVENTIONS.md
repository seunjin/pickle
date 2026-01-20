# 프로젝트 규칙 및 컨벤션 (Project Rules & Conventions)

이 문서는 프로젝트의 일관성을 유지하기 위한 규칙을 정의합니다. 모든 기여자는 이 규칙을 준수해야 합니다.

## 1. 기술 스택 (Tech Stack)

| 구분 | 스택 | 비고 |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) |  |
| **Library** | React 19 + React Compiler | **New Hooks 적극 사용** (`use`, `useOptimistic` 등) |
| **Language** | TypeScript 5.x | Strict Mode 필수 |
| **Styling** | Tailwind CSS v4 | `clsx`, `tailwind-merge` 사용. (정렬: **Biome** `useSortedClasses` 사용) |
| **Linter** | Biome | Prettier/ESLint 대체 |
| **State** | React Query v5 (Server), Zustand (Client) |  |
| **Form** | React Hook Form + Zod |  |

## 2. 네이밍 규칙 (Naming Conventions)

| 구분 | 규칙 | 예시 | 비고 |
| :--- | :--- | :--- | :--- |
| **디렉토리 (Folders)** | `kebab-case` | `user-profile`, `auth` | 소문자 및 하이픈 사용 |
| **파일 (Files)** | `kebab-case` | `index.ts`, `utils.ts` | 일반 파일 |
| **컴포넌트 파일** | **`PascalCase`** | `UserAvatar.tsx`, `Button.tsx` | **React 컴포넌트 파일 필수** |
| **함수 (Functions)** | `camelCase` | `getUserData`, `handleClick` | 동사로 시작 권장 |
| **타입/인터페이스** | `PascalCase` | `User`, `ApiResponse` | `I` 접두어 사용 지양 (Interface) |

## 3. Git 컨벤션 (Git Conventions)

### 3.1 워크플로우 (Trunk-based Development)
우리는 **Trunk-based Development** 전략을 따릅니다.

*   **Main Branch**: 언제나 라이브에 배포 가능한 상태(Production-ready)여야 합니다. (Source of Truth)
*   **Workflow**:
    1.  `main` 브랜치에서 분기하여 기능 브랜치 생성
    2.  개발 완료 후 PR(Pull Request) 생성
    3.  CI 테스트 통과 후 `main`에 Squash Merge
*   **Feature Branch**: 수명이 짧아야 합니다(Short-lived). 작업 단위는 작게 유지하세요. (PR 300~400줄 권장)

### 3.2 커밋 메시지 (Conventional Commits)
[Conventional Commits](https://www.conventionalcommits.org/) 규칙을 따릅니다.

#### 구조
```text
<type>(<scope>?): <subject>

<body?>

<footer?>
```

#### Types
| 태그 | 설명 |
| :--- | :--- |
| `feat` | 새로운 기능 추가 |
| `fix` | 버그 수정 |
| `ui` | UI 스타일 변경 (로직 없음) |
| `refactor` | 코드 리팩토링 (기능 변경 없음) |
| `perf` | 성능 개선 |
| `docs` | 문서 수정 |
| `chore` | 빌드, 패키지 설정 등 |

#### Examples
- `feat(auth): 구글 로그인 연동 기능 추가`
- `fix(contracts): User 타입 정의 오류 수정`
- `refactor(web/chat): 메시지 리스트 컴포넌트 분리`

### 3.3 브랜치 네이밍
- `feat/feature-name` (예: `feat/login-page`)
- `fix/bug-name` (예: `fix/header-layout`)

## 4. 코드 작성 원칙 (Coding Principles)

### 4.1 Component Structure (Strict Order)
모든 컴포넌트는 아래 순서를 엄격히 준수합니다.

```typescript
// 1. Imports
import { useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';

// 2. Types/Interfaces
interface Props {
  title: string;
}

// 3. Component Definition
export const ExampleComponent = ({ title }: Props) => {
  // 3-1. Hooks (Custom Hooks, React Query, Form)
  const { user } = useAuth();
  
  // 3-2. Logic (Handlers, Derived State)
  const isValid = !!user;

  // 3-3. Guard Clauses (Early Return)
  if (!isValid) return null;

  // 3-4. JSX Render
  return <div>{title}</div>;
};
```

### 4.2 TypeScript & Safety
- **건전한 코드**: `any` 타입 사용을 지양하고, 구체적인 타입을 명시합니다.
- **Literal as Const**: 유니온 타입이나 고정된 설정값은 `as const`를 사용하여 리터럴 타입을 유지합니다.
  ```typescript
  // Recommended
  export const TABS = {
    HOME: 'home',
    PROFILE: 'profile',
  } as const;
  
  export type Tab = (typeof TABS)[keyof typeof TABS]; // 'home' | 'profile'
  ```
- **Discriminated Unions (구별된 유니온)**: 타입에 따라 데이터 구조가 달라지는 경우(Polymorphism), 반드시 공통 판별자(`type`, `kind` 등)를 가진 Discriminated Union을 사용하여 타입 추론을 돕습니다. `as` 캐스팅이나 `any` 사용을 지양합니다.
  ```typescript
  // ✅ Good
  type Shape = 
    | { kind: "circle"; radius: number }
    | { kind: "square"; side: number };
    
  // ❌ Bad
  type Shape = { kind: "circle" | "square"; radius?: number; side?: number };
  ```
- **Custom Utility Types**: 복잡한 타입 추론이 필요한 경우 유틸리티 타입을 적극 활용하여 중복을 줄입니다.

### 4.2.1 Safe Data Structures (Schema-First)
- **Schema Centralization**: DB 타입과 애플리케이션 타입(Schema)은 모두 `@pickle/contracts` 패키지에서 정의하고 관리합니다. 프론트엔드나 백엔드 로직에서 임의로 타입을 정의하지 않습니다.
- **Runtime Validation**: API 응답이나 외부 데이터 사용 시, `as unknown as Type` 같은 **타입 단언(Type Assertion)을 금지**합니다. 대신 **Zod Schema**의 `safeParse`를 사용하여 런타임 무결성을 검증합니다.
  ```typescript
  // ❌ Bad: 컴파일러를 속이는 행위
  const user = data as unknown as AppUser;

  // ✅ Good: 실제 데이터를 검증하고 안전하게 변환
  const parsed = appUserSchema.safeParse(data);
  if (!parsed.success) return null;
  const user = parsed.data; 
  ```

### 4.3 Component & Logic
- **SOLID 원칙**: 단일 책임 원칙(SRP)을 준수하고, 함수는 한 가지 일만 하도록 작게 만듭니다.
- **Named Exports**: 컴포넌트와 함수는 디버깅과 일관성을 위해 `default export` 대신 `named export`를 권장합니다.
- **주석**: 코드 자체로 설명이 되도록 작성하되, 복잡한 비즈니스 로직은 주석으로 '왜(Why)'를 설명합니다.

### 4.4 React 19 & Performance (New)
- **React Compiler**: 별도의 `useMemo`, `useCallback` 없이도 컴파일러가 최적화를 수행합니다. 불필요한 메모이제이션을 지양하세요.
- **Server Actions**: 데이터 변형(Mutation) 로직은 API 라우트보다 **Server Actions**를 우선하여 사용합니다.
- **New Hooks**:
  - `use`: Promise나 Context를 읽을 때 사용 (비동기 처리 간소화).
  - **`useOptimistic` + React Query 조합**: 
    - 클릭 즉시 반응이 필요한 UI(좋아요, 북마크 등)에서는 `useOptimistic`으로 로컬 상태를 먼저 갱신하고,
    - 백그라운드에서는 React Query의 `onMutate`를 통해 전역 캐시의 정합성을 맞춥니다.
    - [더 자세한 가이드](file:///Users/jin/Desktop/dev/pickle-note/docs/react_19_guidelines.md)를 참고하세요.
  - `useFormStatus`: 폼 제출 상태 관리 시 사용.

### 4.5 Type-Safe Optimistic Updates (Mutation)
- **No `any` in Cache Update**: `onMutate` 내부에서 캐시를 직접 수정할 때 `any` 타입을 사용하는 대신, 공용 제네릭 유틸리티를 사용합니다.
- **Generic Utility**: `updateCacheItem<T>`와 같은 유틸리티를 통해 업데이트 페이로드의 타입 안전성을 보장합니다.
  - 위치: `src/shared/lib/react-query/optimistic.ts`

### 4.6 Import Order
1. 외부 패키지 (`react`, `react-dom`, 등)
2. 내부 라이브러리/유틸리티 (`@/shared/*`, `@/features/*`)
3. 상대 경로 컴포넌트 (`./Button`)
4. 스타일 (`./style.css`)

### 4.6 Import Strategy (Deep Import)
- **Barrel File 지양**: `index.ts`를 통해 모든 것을 모아서 내보내는 방식(Barrel File)을 지양합니다.
- **Deep Import 권장**: 필요한 모듈이 위치한 파일 경로를 직접 명시하여 가져옵니다.
  - ✅ Good: `import { getUser } from '@/features/auth/api/getUser'`
  - ❌ Bad: `import { getUser } from '@/features/auth'`
- **이유**:
  1. **순환 참조 방지**: 모듈 간 의존 관계를 명확히 하여 순환 참조 오류를 예방합니다.
  2. **Tree Shaking 최적화**: 사용하지 않는 코드가 번들에 포함되는 것을 방지합니다.
  3. **명확한 출처**: 코드를 읽을 때 해당 함수/컴포넌트의 정확한 위치를 파악하기 쉽습니다.

### 4.7 Separation of Concerns (API vs Model)
- **API (Service) 분리**: DB 연결, `fetch` 호출 등 실제 데이터 접근 로직은 반드시 `features/<feature>/api` 폴더 내에 별도 함수로 분리합니다.
  - ❌ Hook 내부나 컴포넌트에 직접 작성 금지.
- **Model (Hook) 역할**: `React Query`나 `Zustand` 등을 사용하여 상태를 관리하고, `api` 폴더의 함수를 호출하는 역할만 수행합니다.
- **예시**:
  - `api/getNotes.ts`: `supabase.from('notes').select(...)` (순수 데이터 로직)
  - `model/useNote.ts`: `useQuery({ queryFn: getNotes })` (상태 관리 로직)

## 5. 데이터 동기화 컨벤션 (Data Sync Conventions)

### 5.1 크로스 탭 실시간 동기화 (BroadcastChannel)
익스텐션과 웹 앱, 또는 웹 앱의 여러 탭 간의 실시간 데이터 일관성을 위해 `BroadcastChannel`을 사용합니다.

1. **채널 이름**: `pickle_sync`로 통일합니다.
2. **이벤트 타입**: `type: "PICKLE_NOTE_SAVED"` 등 대문자 스네이크 케이스를 사용합니다.
3. **동작**: 익스텐션 또는 특정 탭에서 데이터 변경(CUD) 발생 시 신호를 전송하고, 수신 측에서는 React Query의 `invalidateQueries`를 통해 데이터를 최신화합니다.
4. **대안 (StaleTime 0)**: 탭이 꺼져있거나 신호를 놓친 경우를 대비하여, 중요한 목록 쿼리는 `staleTime: 0`을 설정해 윈도우 포커스 시점에 항상 리프레시되도록 보장합니다.

## 6. Console 로깅 정책 (Logging Conventions)

### 6.1 Policy
- `console.log` / `console.info` / `console.debug` / `console.warn` / `console.error` **직접 호출 금지** (예외는 아래 참조).
- 모든 로그는 `shared/lib/logger.ts` (프로젝트 로거 유틸리티)를 통해 출력합니다.
- **로깅 레벨**: `debug` | `info` | `warn` | `error`
- **프로덕션 기본 정책**: `debug` 로그는 빌드 타임 또는 런타임에서 출력하지 않습니다.

### 6.2 Allowed Levels
| 레벨 | 용도 | 프로덕션 출력 |
|:---|:---|:---:|
| `logger.debug(...)` | 로컬 개발에서만 허용 | ❌ |
| `logger.info(...)` | 사용자 플로우 추적 (최소한), 운영 이슈 트래킹 | ✅ |
| `logger.warn(...)` | 복구 가능한 비정상 상태 (fallback 수행) | ✅ |
| `logger.error(...)` | 예외/실패 + **반드시 컨텍스트 포함** | ✅ |

### 6.3 PII/Secret Rule (민감 정보 금지)
아래 데이터는 로그에 **절대 출력 금지**:
- `access_token`, `refresh_token`, `Authorization` 헤더
- 이메일, 전화번호, 실명
- URL Query에 포함된 민감 파라미터

필요 시 마스킹 유틸리티 사용:
```typescript
// 민감 정보 마스킹 예시
logger.info("User login", { email: maskEmail(user.email) });
```

### 6.4 Exception (예외 허용)
- **3rd-party 라이브러리/프레임워크 요구**: `console.error`가 필요한 경우 주석으로 사유 명시 + 최소 범위로 제한
- **eslint-disable / biome-ignore 사용**: "왜 필요한지" 주석 필수
  ```typescript
  // biome-ignore lint: Supabase 내부에서 console.error를 요구함
  console.error("[Supabase Auth]", error);
  ```

### 6.5 Message Shape (구조화 로깅)
- 문자열만 출력하지 말고, **구조화된 컨텍스트**를 함께 전달합니다.
  ```typescript
  // ❌ Bad: 문자열만 출력
  logger.error("Failed to save note");
  
  // ✅ Good: 구조화된 컨텍스트 포함
  logger.error("Failed to save note", { noteId, workspaceId, cause: error });
  ```

### 6.6 Toast + Logger 연동
사용자에게 알려야 하는 실패는 **Toast와 Logger를 함께 사용**합니다:
- `toast.error()` → UX (사용자 알림)
- `logger.error()` → 진단 (개발자 디버깅)

```typescript
try {
  await saveNote(payload);
} catch (error) {
  toast.error({ title: "노트 저장에 실패했습니다." });
  logger.error("Failed to save note", { noteId, cause: error });
}
```

### 6.7 Logger 구현
`shared/lib/logger.ts`에 통일된 로거 유틸리티를 구현합니다.

```typescript
// shared/lib/logger.ts
type LogContext = Record<string, unknown>;

export const logger = {
  debug: (message: string, context?: LogContext) => {
    if (process.env.NODE_ENV === "development") {
      console.debug(`[DEBUG] ${message}`, context);
    }
  },
  
  info: (message: string, context?: LogContext) => {
    console.info(`[INFO] ${message}`, context);
  },
  
  warn: (message: string, context?: LogContext) => {
    console.warn(`[WARN] ${message}`, context);
  },
  
  error: (message: string, context?: LogContext) => {
    console.error(`[ERROR] ${message}`, context);
    // TODO: Sentry 연동 시 추가
    // if (process.env.NODE_ENV === "production") {
    //   Sentry.captureMessage(message, { extra: context });
    // }
  },
};
```

### 6.8 Extension 환경
Chrome Extension은 로깅 환경이 다르므로 별도 고려가 필요합니다.

| 환경 | DevTools 위치 | 특이사항 |
|:---|:---|:---|
| **Content Script** | 웹페이지 DevTools (Console) | 페이지와 동일 |
| **Background (Service Worker)** | `chrome://extensions` > 검사 | 별도 창에서 확인 |
| **Popup** | Popup 우클릭 > 검사 | 별도 창에서 확인 |

Extension에서는 `chrome.runtime` 환경 체크 후 로깅:
```typescript
const isExtension = typeof chrome !== "undefined" && chrome.runtime?.id;
```

### 6.9 Lint 연동 (강제 규칙)
컨벤션을 강제하기 위해 Biome/ESLint 룰을 설정합니다.

```json
// biome.json
{
  "linter": {
    "rules": {
      "suspicious": {
        "noConsole": "error"
      }
    }
  }
}
```

예외가 필요한 경우 주석으로 사유를 명시합니다:
```typescript
// biome-ignore lint/suspicious/noConsole: 3rd-party 라이브러리 요구
console.error("[Supabase Auth]", error);
```

## 7. 공용 훅 패턴 (Shared Hook Patterns)

### 7.1 Location Rule
| 훅 유형 | 위치 | 예시 |
|:---|:---|:---|
| 도메인 지식 없는 범용 훅 | `shared/hooks/*` | `useIntersectionObserver`, `useDebouncedCallback` |
| 특정 기능에 종속된 훅 | `features/<feature>/model/*` | `useNoteList`, `useSyncNoteList` |

> **Note**: `shared/lib/`는 순수 함수용, `shared/hooks/`는 React 훅 전용으로 분리합니다.

### 7.2 API Shape Rule
- **옵션**: 단일 객체로 받음 (TanStack 패턴과 일관성)
- **옵셔널 콜백**: `onXxx` 형태
- **반환**: 튜플 또는 객체 (일관성 유지)

```typescript
// ✅ Good: 옵션 객체 + 명확한 반환
const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });

// ❌ Bad: 위치 기반 인자
const [ref, isIntersecting] = useIntersectionObserver(0.1, null, "0px");
```

### 7.3 useIntersectionObserver
- **SSR/Extension safe**: `typeof window/document` 체크 필수
- **반환**: `{ ref, isIntersecting }`
- **기본 옵션**: `{ root: null, threshold: 0, rootMargin: "0px" }`

```typescript
// SSR/Extension 안전 패턴
const isBrowser = typeof window !== "undefined" && typeof document !== "undefined";
if (!isBrowser) return { ref: () => {}, isIntersecting: false };
```

**사용 예시**:
```tsx
const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });

useEffect(() => {
  if (isIntersecting && hasNextPage) {
    fetchNextPage();
  }
}, [isIntersecting, hasNextPage, fetchNextPage]);

return <div ref={ref} />;
```

### 7.4 useDebouncedCallback
- **반환**: `{ run, cancel, flush }`
- **delay 기본값**: 300ms (override 가능)
- **Unmount 시**: 자동 cancel

```typescript
// 기본값 사용
const { run: debouncedSearch } = useDebouncedCallback(handleSearch);

// delay override
const { run, cancel } = useDebouncedCallback(handleSearch, { delay: 500 });
```

### 7.5 Naming Rule
- **범용 훅에 도메인 이름 금지**
  - ❌ `useNoteIntersectionObserver`
  - ✅ `useIntersectionObserver`
- **도메인 훅은 features 내부에 배치**
  - ✅ `features/note/model/useNoteList.ts`


## 8. 에러 핸들링 표준 (Error Handling)

### 8.1 Normalized Error Shape
앱 내부에서 다루는 에러는 표준화된 형태로 변환합니다.

```typescript
// shared/lib/error.ts
interface AppError {
  code: ApiErrorCode;         // 에러 코드 (enum)
  message: string;            // 개발자용 메시지 (로깅)
  userMessage: string;        // 사용자용 메시지 (UI)
  cause?: unknown;            // 원본 에러
}
```

### 8.2 에러 코드 정의
```typescript
enum ApiErrorCode {
  NETWORK_ERROR = "NETWORK_ERROR",     // 네트워크 에러 → 재시도 가능
  UNAUTHORIZED = "UNAUTHORIZED",       // 401 → 로그인 페이지 리다이렉트
  FORBIDDEN = "FORBIDDEN",             // 403 → 권한 없음
  NOT_FOUND = "NOT_FOUND",             // 404 → 재시도 불필요
  VALIDATION_ERROR = "VALIDATION_ERROR", // 입력값 오류
  SERVER_ERROR = "SERVER_ERROR",       // 500 → 재시도 가능
  UNKNOWN = "UNKNOWN",                 // 알 수 없는 에러
}
```

### 8.3 handleApiError 구현
Supabase PostgrestError/AuthError를 AppError로 변환합니다.

- **위치**: `shared/lib/error.ts`

```typescript
function handleApiError(error: unknown): AppError {
  // Supabase PostgrestError
  if (isPostgrestError(error)) {
    return mapPostgrestError(error);
  }
  // Supabase AuthError
  if (isAuthError(error)) {
    return mapAuthError(error);
  }
  // 기타 에러
  return {
    code: ApiErrorCode.UNKNOWN,
    message: String(error),
    userMessage: "오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    cause: error,
  };
}
```

### 8.4 UI Rule: 사용자 메시지 분리
- **사용자에게 표시**: `appError.userMessage`
- **개발 진단**: `logger.error(appError.message, { code: appError.code, cause: appError.cause })`

```typescript
try {
  await api();
} catch (error) {
  const appError = handleApiError(error);
  toast.error({ title: appError.userMessage });
  logger.error(appError.message, { code: appError.code, cause: appError.cause });
}
```

### 8.5 Toast vs Inline Error
| 상황 | UI 처리 | 예시 |
|:---|:---|:---|
| **초기 데이터 로드 실패** | Inline Error + 재시도 버튼 | 노트 목록 로드 실패 |
| **사용자 액션 실패** | Toast | 저장, 삭제 실패 |
| **부분 데이터 실패** | Toast + 해당 항목 표시 | 태그 불러오기 실패 |
| **인증 실패 (401)** | 로그인 페이지 리다이렉트 | 세션 만료 |

### 8.6 ErrorBoundary 적용 범위
복구 불가한 렌더링 에러를 잡는 용도로 사용합니다.

**적용 우선순위**:
1. **App Shell (최상위)** - 전역 에러 캐치
2. **Feature Boundary** - 기능별 격리 (NotesPanel, Sidebar 등)

**Fallback UI 필수 요소**:
- 재시도 버튼
- 에러 ID (Sentry digest 등, 있는 경우)

```tsx
// Next.js error.tsx 활용 (React 19)
function ErrorFallback({ 
  error, 
  reset 
}: { 
  error: Error & { digest?: string }; 
  reset: () => void;
}) {
  return (
    <div className="error-container">
      <p>문제가 발생했습니다.</p>
      {error.digest && (
        <p className="text-xs text-muted">오류 ID: {error.digest}</p>
      )}
      <button onClick={reset}>다시 시도</button>
    </div>
  );
}
```


## 9. 상태 관리 가이드 (State Management)

### 9.1 결정 트리
PR에서 바로 판정 가능하도록 아래 순서로 결정합니다.

```
1. 서버 원천 데이터인가?
   ├─ Yes → React Query (Query Factory 패턴 준수)
   └─ No → 2번으로

2. 컴포넌트 로컬에서만 쓰는 UI 상태인가?
   ├─ Yes → useState / useReducer
   └─ No → 3번으로

3. 여러 컴포넌트/깊은 트리에서 공유되는 UI 상태인가?
   └─ Yes → Zustand (최소화 원칙)
```

### 9.2 상태 도구별 용도
| 도구 | 용도 | 예시 |
|:---|:---|:---|
| `useState` | 컴포넌트 로컬 UI 상태 | 모달 열림, 드롭다운, 입력값 |
| React Query | 서버 데이터 (캐싱, 동기화) | 노트 목록, 사용자 정보 |
| Zustand | 전역 UI 상태 (최소화) | 사이드바 열림, 테마 |
| React Hook Form | 폼 상태 관리 | 회원가입, 노트 수정 |

### 9.3 금지 규칙

**❌ React Query cache 오용 금지**
- 선택/필터/드롭다운 open 같은 UI state를 Query cache에 저장 금지

**❌ 서버 데이터 Zustand 복제 금지**
- `notes`, `tags` 같은 서버 데이터를 Zustand에 복제 저장 금지
- **예외**: 임시 드래프트, 편집 버퍼는 허용

### 9.4 Zustand 허용 케이스
- 전역 단축키/패널 열림 상태 (Extension overlay 등)
- 폼 드래프트 (서버 저장 전 임시 상태)
- 멀티스텝 입력 상태

## 10. 스타일 가이드 (Styling Guide)

### 10.1 cn() Rule
- className 조합은 `cn()`만 사용 (clsx 직접 호출 금지)
- 조건부 클래스는 `cn(base, condition && "class")` 형태로 통일

```tsx
// ❌ Bad: 템플릿 리터럴 직접 사용
className={`btn ${isActive ? 'bg-blue-500' : 'bg-gray-500'}`}

// ❌ Bad: clsx 직접 호출
className={clsx("btn", isActive && "bg-blue-500")}

// ✅ Good: cn() 유틸리티 사용
className={cn("btn", isActive ? "bg-blue-500" : "bg-gray-500")}
```

### 10.2 Color Rule
- **권장**: 디자인 토큰 기반 클래스 (`text-foreground`, `bg-surface`, `bg-base-*`, `text-neutral-*`)
- **허용**: 임의 색상 (`bg-[#123456]`, `text-red-500`) - 제한 없음
- **새 색상 추가 시**: 재사용이 예상되면 토큰 추가 검토

> **Note**: 현재 프로젝트는 초기 단계이므로 임의 색상 사용을 제한하지 않습니다. 추후 디자인 시스템이 안정화되면 토큰 우선 정책으로 전환할 수 있습니다.

### 10.3 긴 className 처리
- 150자 초과 시 `cva` (class-variance-authority) 또는 상수로 분리 검토

## 11. 파일 크기 가이드라인 (File Size Guidelines)

### 11.1 Hard Limit
| 파일 유형 | 기준 | 조치 |
|:---|:---:|:---|
| **UI 컴포넌트** | 300 LOC 초과 | 분리 **필수 검토** |
| **API 함수** | 150 LOC 초과 | 분리 **필수** |
| **훅 (Hooks)** | 100 LOC 초과 | 분리 검토 |

> **Note**: 테스트/스토리/타입 정의는 LOC 판단에서 제외합니다.

### 11.2 Split Strategy

**컴포넌트가 커질 때:**
1. `ui/`에서 프레젠테이션 컴포넌트 분리
2. 이벤트/파생 로직은 `model/` 훅으로 이동
3. 데이터 접근은 `api/`로 이동 (UI에서 직접 호출 금지)

**API가 커질 때:**
- 쿼리 빌더/필터 생성 로직을 별도 유틸로 분리
- 에러 변환(`handleApiError`)과 실제 호출 분리

### 11.3 분리 신호
- 파일 내 `// Section:` 주석이 3개 이상
- 하나의 컴포넌트에서 `useState` 3개 이상 사용

### 11.4 Exception
강한 응집이 필요한 단일 파일은 예외 허용. 예외 시 파일 상단에 주석 필수:

```typescript
// CONVENTION-EXCEPTION: 단일 폼 컴포넌트로 응집 유지 필요
```

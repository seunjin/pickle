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


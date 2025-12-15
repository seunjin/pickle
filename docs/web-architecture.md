# apps/web 아키텍처 가이드 (FSD-lite)

이 문서는 `apps/web` (Next.js App Router) 프로젝트의 폴더 구조와 아키텍처 규칙을 설명합니다.
우리는 복잡성을 줄이고 유지보수성을 높이기 위해 **FSD(Feature-Sliced Design)의 경량화 버전(FSD-lite)**을 채택했습니다.

## 1. 상위 레벨 구조 (High-Level Structure)

`src` 폴더는 크게 세 가지 계층으로 나뉩니다.

```bash
apps/web/src/
├── app/        # 라우팅 및 레이아웃 (Routing & Layouts)
├── features/   # 비즈니스 기능 슬라이스 (Feature Slices)
└── shared/     # 재사용 가능한 범용 코드 (Reusable Primitives)
```

---

## 2. 계층별 역할 및 규칙

### 🟧 App Layer (`src/app`)
Next.js의 App Router가 위치하는 곳입니다.

*   **역할**: URL 라우팅, 페이지 레이아웃, 그리고 기능(Feature)들의 조립(Composition).
*   **규칙**:
    *   **비즈니스 로직 금지**: 페이지 컴포넌트는 최대한 얇게 유지하며, 로직은 `features`로 위임합니다.
    *   **Direct DB 접근 금지 (UI Layer)**: UI 컴포넌트나 페이지에서 Supabase를 직접 호출하지 않습니다.
    *   **Import**: `features/**`의 Public API(`index.ts`)를 통해서만 컴포넌트를 가져옵니다.

### 🟩 Features Layer (`src/features`)
사용자에게 가치를 제공하는 **기능 단위(Slice)**들이 위치하는 핵심 영역입니다.
예: `auth`, `workspace`, `notes`...

각 기능 폴더는 다음과 같은 내부 구조를 가집니다:

```bash
src/features/<feature-name>/
├── api/      # 서버 액션, Supabase 쿼리/뮤테이션
├── model/    # 로컬 상태, Zod 스키마, 커스텀 훅, 비즈니스 로직
├── ui/       # 해당 기능의 UI 컴포넌트 (Forms, Lists, Cards...)
└── index.ts  # 외부 공개 API (Public Exports)
```

*   **규칙**:
    *   **캡슐화**: 다른 기능에서 이 기능을 사용할 때는 반드시 `index.ts`를 통해서만 접근해야 합니다. (`features/auth/ui/LoginForm` 직접 임포트 금지 -> `features/auth`에서 임포트)
    *   **Supabase 접근**: 오직 `api/` 폴더 내부에서만 Supabase 클라이언트를 사용하거나 데이터를 요청해야 합니다.

### 🟦 Shared Layer (`src/shared`)
도메인(비즈니스) 지식이 없는, 프로젝트 전반에서 재사용되는 코드입니다.

```bash
src/shared/
├── ui/       # @pickle/ui 등의 래퍼 또는 범용 UI 컴포넌트
├── lib/      # 유틸리티 (supabase client, fetcher, dateFormatter 등)
├── config/   # 상수, 환경변수 설정
└── styles/   # 전역 스타일
```

*   **규칙**:
    *   **도메인 용어 사용 금지**: `WorkspaceCard`, `UserTable` 같은 이름은 사용할 수 없습니다. `Card`, `Table` 처럼 범용적이어야 합니다.
    *   특정 기능에 종속된 코드는 `features`로 이동시켜야 합니다.

---

## 3. 개발 워크플로우 예시 (Example Workflow)

새로운 기능인 "댓글(Comments)" 기능을 만든다고 가정해 봅시다.

1.  **폴더 생성**: `src/features/comments` 폴더를 만듭니다.
2.  **데이터 로직 (`api/`)**: `src/features/comments/api/actions.ts`를 만들고 Supabase에서 댓글을 가져오거나 작성하는 Server Action을 구현합니다.
3.  **상태/로직 (`model/`)**: 필요한 경우 `useCommentStore`나 댓글 입력 폼 검증을 위한 Zod 스키마를 `src/features/comments/model/`에 작성합니다.
4.  **UI 구현 (`ui/`)**: `CommentList.tsx`, `CommentForm.tsx`를 `src/features/comments/ui/`에 구현합니다.
5.  **공개 (`index.ts`)**: `src/features/comments/index.ts`에서 필요한 컴포넌트(예: `CommentSection`)만 export 합니다.
6.  **페이지 조립 (`app/`)**: `src/app/notes/[id]/page.tsx`에서 `<CommentSection />`을 import 하여 배치합니다.

---

## 4. 모노레포 패키지 활용 (External Packages)

`apps/web`은 monorepo 내부의 패키지들을 적극 활용하여 중복을 줄입니다.

### 📦 `@pickle/contracts` (Data Contracts)
*   **역할**: Web과 Extension이 공유하는 **데이터 타입, Zod 스키마, DTO**의 단일 진실 공급원(SSOT).
*   **규칙**:
    *   API 응답 타입이나 공용 도메인 모델(User, Note 등)은 여기서 정의하고 import 해서 사용합니다.
    *   `src/features/<feature>/model`에서 재정의하지 않고 contracts를 확장하거나 그대로 사용합니다.

### 🎨 `@pickle/ui` (Design System)
*   **역할**: shadcn/ui 기반의 **원자 단위 UI 컴포넌트** (Button, Input, Dialog 등).
*   **규칙**:
    *   `src/shared/ui`는 이 패키지의 컴포넌트를 래핑하거나 조합하는 용도로만 사용합니다.
    *   직접 스타일링을 수정하기보다 `@pickle/ui`의 변형(Variants)을 활용합니다.


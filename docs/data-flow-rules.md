# 데이터 접근 및 캐싱 가이드 (Data Access & Caching Guidelines)

이 문서는 `apps/web`(Next.js)과 `apps/extension`(Vite), 그리고 `packages/contracts`를 사용하는 모노레포 환경에서의 **데이터 접근, API 경계, 캐싱, 그리고 코드 공유 규칙**을 정의합니다.

## 1. 핵심 원칙 (Core Principles)

1.  **Single Source of Truth**: 데이터의 형태(Shape)와 검증(Validation) 규칙은 `@pickle/contracts`로 통일합니다.
2.  **Transport 분리**: Web(Server-side DB Access)과 Extension(HTTP Request)은 통신 방식이 근본적으로 다르므로, 억지로 구현을 공유하지 않습니다.
3.  **Boundary 명확화**: UI 컴포넌트는 DB나 HTTP Fetch를 직접 알지 못해야 하며, 반드시 **Feature API**를 통해 접근해야 합니다.
4.  **안전 우선 캐싱**: 캐싱은 성능 최적화 수단일 뿐이며, 권한이나 개인화 데이터의 안전성보다 우선할 수 없습니다.

---

## 2. 용어 정의 (Terminology)

| 용어 | 설명 | 예시 |
| :--- | :--- | :--- |
| **Contract** | 데이터의 모양에 대한 약속 (타입, Zod 스키마) | `@pickle/contracts` |
| **Transport** | 데이터를 가져오는 물리적 방식 | DB SDK 호출, fetch, RPC |
| **Feature API** | 기능(Feature) 내부에서 제공하는 데이터 및 로직의 공개 인터페이스 | `features/auth/api/*` |
| **Service** | 실제 데이터 접근 및 비즈니스 로직을 수행하는 함수. Transport 상세를 캡슐화함. | `UserService.getUser()` |

---

## 3. 코드 공유 규칙 (Shared Rules)

### 📦 `packages/contracts`
데이터의 **"모양"**만을 정의합니다. "동작"은 포함하지 않습니다.

*   ✅ **허용**: DTO 타입, Zod 스키마, Enum, 상수, 공통 에러 포맷
*   ❌ **금지**: DB Client, Fetch Client, Server Actions, 비즈니스 로직(권한 판정 등)

---

## 4. Web 데이터 접근 경계 (`apps/web`)

### 🟧 App Layer (`src/app`)
*   ✅ **허용**: 라우팅, 레이아웃, 페이지 조립, Feature API 호출
*   ❌ **금지**: **DB 직접 접근**, Feature 내부 UI 직접 import (`features/auth/ui/Login` 금지)

### 🟩 Features Layer (`src/features`)

#### `features/<feature>/api`
*   데이터 접근의 **유일한 입구**입니다.
*   ✅ **허용**: Server Actions, Supabase Query, Route Handler에서 재사용할 Service 함수
*   ❌ **금지**: UI 컴포넌트에서 직접 호출되지 않는 Private 함수들의 무분별한 노출

#### `features/<feature>/model`
*   상태 관리와 비즈니스 로직을 담당합니다.
*   ✅ **허용**: 로컬 상태(Store), 커스텀 훅, 유효성 검증 로직
*   ❌ **금지**: **Transport 계층(Supabase/Fetch) 직접 호출**

#### `features/<feature>/ui`
*   순수하게 화면 그리기만 담당합니다.
*   ✅ **허용**: UI 렌더링, 이벤트 핸들링
*   ❌ **금지**: **DB 접근, API Fetch 직접 호출** (항상 Model이나 API를 경유)

### 🟦 Shared Layer (`src/shared`)
*   ✅ **허용**: Supabase Client 생성기, Fetch Wrapper, 공통 유틸리티
*   ❌ **금지**: 도메인(비즈니스) 지식이 포함된 코드

---

## 5. Extension 데이터 접근 경계 (`apps/extension`)

*   ❌ **절대 금지**: **Supabase DB 직접 접근** (보안 및 배포 리스크)
*   ✅ **허용**: 오직 **HTTP(`fetch`)**를 통한 `apps/web`의 API 호출만 허용
*   **권장 패턴**: `src/lib/api-client` 등을 두어 HTTP 요청을 캡슐화하고, 응답 데이터는 `contracts`의 Zod 스키마로 런타임 검증(Parse)을 수행합니다.

---

## 6. API Route 핸들러 정책 (Route Handlers)

Next.js의 Route Handler(`app/api/**`)는 **HTTP 경계**로서의 역할만 수행해야 합니다.

*   **위치**:
    *   `app/api/internal/**`: Web 프론트엔드 전용 (Client Component에서 호출)
    *   `app/api/external/**`: Extension 등 외부 시스템 전용
*   **구현 규칙**:
    1.  핸들러 내부에서 **DB 쿼리를 직접 작성하지 않습니다.**
    2.  반드시 `features/<feature>/api`의 Service 함수를 호출하여 처리합니다.
    3.  **책임 범위**: 인증(Auth), 입력 검증(Zod), Feature API 호출, 표준 응답 반환

---

## 7. 캐싱 정책 (Web Only)

Next.js의 캐싱 기능은 강력하지만 주의해서 사용해야 합니다.

### 1️⃣ Request Memoization (`react/cache`)
*   **용도**: 하나의 요청 처리 과정에서 동일한 데이터 중복 호출 방지
*   **사용 권장**: 기본적으로 사용 권장 (특히 Layout과 Page에서 동일 데이터 필요 시)
*   **안전성**: 요청(Request) 범위 내에서만 유효하므로 개인화 데이터에도 안전함

### 2️⃣ Data Cache (`next/cache`)
*   **용도**: 여러 요청에 걸쳐 재사용되는 서버 측 캐시 (ISR 유사)
*   **사용 조건 (모두 충족 시 허용)**:
    1.  모든 사용자에게 동일한 결과가 반환되는가? (비개인화)
    2.  사용자 권한이나 세션에 따라 결과가 달라지지 않는가?
    3.  데이터 변경 빈도가 낮거나, 명확한 무효화(Revalidate) 전략이 있는가?
*   **⚠️ 절대 금지**: **사용자 프로필, 내 노트 목록** 등 개인화된 데이터

### 캐시 무효화 (Invalidation)
Data Cache 사용 시 반드시 무효화 전략을 함께 구현해야 합니다.
*   **Time-based**: `revalidate: N` (초 단위 갱신)
*   **Tag-based**: `revalidateTag(tag)` (데이터 변경 시 즉시 갱신)

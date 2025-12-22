
# 📚 Project Documentation Index

이 디렉토리는 Pickle 프로젝트의 실제 코드와 동기화되는 설계 문서를 담고 있습니다.
모든 문서는 “이론 설명”이 아니라 **구현·리팩토링·확장 시 기준점(Source of Truth)** 으로 사용됩니다.

---

## 1. 문서 사용 원칙 (Document Philosophy)
- 이 문서들은 코드보다 한 단계 위의 규칙을 정의합니다.
- 구현은 자유롭되, 문서에 정의된 **개념·경계·용어**는 반드시 존중합니다.
- **스키마, 권한, 아키텍처 변경 시 → 관련 문서도 함께 수정합니다.**

> ❗ 문서와 코드가 어긋나기 시작하면, 문서는 즉시 신뢰를 잃습니다.

---

## 2. 처음 읽는 순서 (Recommended Reading Order)

### ① 프로젝트 전반 이해
1. [monorepo-structure.md](./monorepo-structure.md)  
   → 전체 레포 구조, apps / packages 역할
2. [WORKSPACE_TECH_SPEC.md](./WORKSPACE_TECH_SPEC.md)  
   → 이 서비스의 핵심 단위인 Workspace 개념과 책임

### ② 인증 · 권한 · 사용자 상태
3. [role_state_policy.md](./role_state_policy.md)  
   → Platform / Workspace / User State 권한 모델
4. [extension_auth_flow.md](./extension_auth_flow.md)  
   → Google OAuth 이후 회원 활성화, 약관 동의, 토큰 흐름

### ③ 데이터 & 스키마
5. [database_schema.md](./database_schema.md)  
   → 실제 DB 테이블 구조, enum, 관계 정의
6. [data_access_layer.md](./data_access_layer.md)  
   → Web / Extension 환경별 데이터 접근 전략과 경계

### ④ 클라이언트 아키텍처
7. [web-architecture.md](./web-architecture.md)  
   → Next.js(App Router) 기반 Web 앱 설계
8. [client_app_architecture.md](./client_app_architecture.md)  
   → CSR 기반 클라이언트 앱의 책임 범위
9. [extension_architecture.md](./extension_architecture.md)  
   → Chrome Extension 구조, isolated world, iframe 전략

### ⑤ UI & 프론트엔드 규칙
10. [ui_isolation_guide.md](./ui_isolation_guide.md)  
    → iframe, content-script 환경에서의 UI 설계 원칙
11. [design_system_tokens.md](./design_system_tokens.md)  
    → 디자인 토큰 → CSS 변수 변환 워크플로우
12. [react_19_guidelines.md](./react_19_guidelines.md)  
    → React 19 기준 권장 패턴 및 사용 제한
13. [CONVENTIONS.md](./CONVENTIONS.md)  
    → 네이밍, 폴더 구조, 코드 스타일, 협업 규칙

---

## 3. 구현 시 참조 가이드 (Implementation Mapping)

| 작업 내용 | 반드시 같이 볼 문서 |
|:---:|:---|
| **로그인 / 회원가입 / 약관** | [extension_auth_flow.md](./extension_auth_flow.md), [role_state_policy.md](./role_state_policy.md) |
| **워크스페이스 생성 / 초대** | [WORKSPACE_TECH_SPEC.md](./WORKSPACE_TECH_SPEC.md), [database_schema.md](./database_schema.md) |
| **권한 추가 / 변경** | [role_state_policy.md](./role_state_policy.md), [database_schema.md](./database_schema.md) |
| **데이터 fetch / mutation** | [data_access_layer.md](./data_access_layer.md) |
| **Extension UI 추가** | [extension_architecture.md](./extension_architecture.md), [ui_isolation_guide.md](./ui_isolation_guide.md) |
| **공통 UI 컴포넌트** | [design_system_tokens.md](./design_system_tokens.md), [CONVENTIONS.md](./CONVENTIONS.md) |

---

## 4. 문서 동기화 규칙 (Docs Sync Checklist)

아래 변경이 발생하면 코드만 고치지 말고 **문서도 반드시 함께 수정합니다.**

### 🔁 변경 트리거 → 수정해야 할 문서

- **DB 스키마 변경**
  - [database_schema.md](./database_schema.md)
  - (권한 관련이면) [role_state_policy.md](./role_state_policy.md)

- **User / Role / State enum 변경**
  - [role_state_policy.md](./role_state_policy.md)
  - [database_schema.md](./database_schema.md)

- **데이터 접근 방식 변경**
  - [data_access_layer.md](./data_access_layer.md)
  - (영향 범위에 따라) [web-architecture.md](./web-architecture.md) / [extension_architecture.md](./extension_architecture.md)

- **UI 격리 방식 변경**
  - [ui_isolation_guide.md](./ui_isolation_guide.md)
  - [extension_architecture.md](./extension_architecture.md)

- **공통 컨벤션 변경**
  - [CONVENTIONS.md](./CONVENTIONS.md)
  - 필요 시 관련 아키텍처 문서

---

## 5. 문서의 위치와 책임
- 이 디렉토리의 문서들은 **“결정된 사실”**을 기록합니다
- 토론 중이거나 실험 단계의 내용은:
  - GitHub Discussion
  - Notion
  - PR Description
  등에 남기고, 결론이 나면 여기로 반영합니다.

---

## 6. 한 줄 요약

> 이 문서들은 “설명서”가 아니라  
> **Pickle 프로젝트의 헌법(Constitution)** 입니다.

# Workspace Architecture Spec (Draft)

## 1. 개요 (Overview)
기존의 **User → Note**의 1:N 구조에서, **User ↔ Workspace ↔ Note**의 계층 구조로 전환합니다.
모든 협업과 데이터 저장은 `Workspace` 단위로 이루어지며, 서비스 초기 가입 시 사용자는 자신만의 기본 워크스페이스를 할당받습니다.

---

## 2. 데이터베이스 스키마 (Database Schema)

### 2.1. `workspaces`
워크스페이스 메타데이터를 저장합니다.
- `id`: UUID (PK)
- `name`: String (e.g., "Jin's Workspace")
- `created_at`: Date //packages/contracts/src/common.ts의 DBDate 여야하는거아닌지?
- `updated_at`: Date //packages/contracts/src/common.ts의 DBDate 여야하는거아닌지?

### 2.2. `workspace_members`
사용자와 워크스페이스 간의 N:M 관계 및 권한을 관리합니다.
- `workspace_id`: UUID (FK -> workspaces.id)
- `user_id`: UUID (FK -> auth.users.id)
- `role`: Enum ('owner', 'member')
- `joined_at`: Date //packages/contracts/src/common.ts의 DBDate 여야하는거아닌지?
- **PK**: (workspace_id, user_id)

### 2.3. `notes` (Migration)
기존 테이블에 컬럼을 추가합니다.
- `workspace_id`: UUID (FK -> workspaces.id) **(New, Required)**
- `user_id`: 글 작성자 기록용으로 유지 (소유권은 워크스페이스에 있음)

---

## 3. 자동화 로직 (Automation)

### 3.1. 회원가입 트리거 (Signup Trigger)
사용자가 회원가입(`auth.users` Insert)하면, Database Trigger가 동작하여 다음을 수행합니다:
1.  **Create Workspace**: "My Workspace" (또는 사용자 이름 기반) 생성
2.  **Add Member**: 해당 사용자를 'owner' 권한으로 `workspace_members`에 추가

### 3.2. RLS (Row Level Security)
- **Notes Access**: 사용자가 `note.workspace_id`의 멤버(`workspace_members`)일 때만 접근 가능.
- **Legacy Support**: 마이그레이션 과도기 동안 `workspace_id`가 NULL인 경우 `user_id`로 접근 허용 (옵션). - 과도기없음 모두 그렇게 적용해도됨

---

## 4. 구현 단계 (Implementation Steps)

1.  **Contract Update**: `packages/contracts`에 `workspace` 타입 정의 추가.
2.  **Migration**:
    - `workspaces`, `workspace_members` 테이블 생성.
    - `notes` 테이블에 `workspace_id` 컬럼 추가 (Nullable for backfill).
    - **Backfill**: 기존 사용자를 위한 워크스페이스 생성 및 기존 노트 연결.
    - `workspace_id`를 Not Null로 변경 및 FK 제약조건 걸기.
3.  **Trigger Setup**: `auth.users` 트리거 함수 작성.
4.  **API Update**: 노트 생성/조회 시 `workspace_id` 필수 파라미터화.

---

## 5. 질문 및 결정 사항 (Open Questions)
- **Q1**: 현재 존재하는 기존 데이터(노트)들이 있나요? 이들은 어떻게 처리할까요? (백필 필요 여부)  - 현재 2개의 데이터가있는데 삭제하고 진행하면됨
- **Q2**: 노트 조회 시 '내 워크스페이스'만 필터링하는 것이 기본인가요? (현재는 단일 워크스페이스 전제) - 워크스페이스 단위로 조회하는게 기본이다


나의 질문 
1. Date 타입은 packages/contracts/src/common.ts의 DBDate 여야하는거아닌지?

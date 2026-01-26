# 📝 PRD 보조 문서 인덱스

이 디렉토리는 **PRD(Product Requirements Document)**, **이용약관**, **개인정보 처리방침** 작성을 위한 보조 자료를 담고 있습니다.

---

## 문서 목록

| 문서 | 설명 | 용도 |
|:---|:---|:---|
| [PRODUCT_OVERVIEW.md](./PRODUCT_OVERVIEW.md) | 제품 개요 | PRD 서론, 제품 소개 작성 |
| [FEATURE_SPECIFICATION.md](./FEATURE_SPECIFICATION.md) | 기능 명세 | PRD 기능 요구사항 작성 |
| [USER_FLOW.md](./USER_FLOW.md) | 사용자 플로우 | PRD UX 섹션, 화면 설계 |
| [DATA_HANDLING.md](./DATA_HANDLING.md) | 데이터 취급 명세 | 이용약관, 개인정보처리방침 작성 |

---

## 각 문서 활용 가이드

### PRD 작성 시
1. **PRODUCT_OVERVIEW.md** → 제품 비전, 타겟 사용자, 핵심 가치
2. **FEATURE_SPECIFICATION.md** → 기능 요구사항, 세부 스펙
3. **USER_FLOW.md** → 사용자 여정, 화면 흐름

### 이용약관 작성 시
- **DATA_HANDLING.md** → 서비스 제한 사항, 계정 정책
- **FEATURE_SPECIFICATION.md** → 서비스 정의, 기능 범위

### 개인정보처리방침 작성 시
- **DATA_HANDLING.md** → 수집 항목, 보관 기간, 삭제 정책, 사용자 권리

---

## 관련 기술 문서

상세 기술 구현은 상위 `docs/` 디렉토리 문서를 참조하세요:

- [database_schema.md](../database_schema.md) - DB 스키마 상세
- [role_state_policy.md](../role_state_policy.md) - 권한 정책 상세
- [storage_policy.md](../storage_policy.md) - 스토리지 정책 상세
- [extension_auth_flow.md](../extension_auth_flow.md) - 인증 플로우 상세

---

*이 문서들은 현재 코드베이스를 분석하여 작성되었습니다. (2026-01-24)*

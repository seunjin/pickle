# 🥒 Pickle (Pickle Note)

**웹의 모든 영감을 한곳에, 피클.**  
피클은 웹 서핑 중 발견한 텍스트, 이미지, 캡처, 북마크를 가장 빠르고 안전하게 보관할 수 있는 개인 라이브러리 서비스입니다.

---

## 🚀 Key Features

- **Quick Capture**: 드래그 한 영역을 즉시 이미지로 저장
- **Smart Bookmark**: 페이지 메타데이터(OG Tag, 파비콘) 자동 추출 및 보관
- **Universal Text**: 선택한 텍스트를 메모와 함께 저장
- **Real-time Sync**: 익스텐션과 웹 대시보드 간의 실시간 데이터 동기화
- **Workspace Based**: 협업과 확장을 고려한 워크스페이스 구조

---

## 📂 Project Structure (Monorepo)

본 프로젝트는 `pnpm workspaces` 기반의 모노레포로 구성되어 있습니다.

- **`apps/web`**: Next.js (App Router) 기반의 메인 서비스 대시보드
- **`apps/extension`**: 크롬/웨일 익스텐션 (Vite + React)
- **`packages/contracts`**: 모든 서비스에서 공유되는 데이터 스키마 (Zod & TS)
- **`packages/ui`**: 디자인 시스템 컴포넌트 라이브러리 (shadcn/ui 기반)
- **`packages/icons`**: SVG 아이콘 시스템

---

## 🛠️ Getting Started

개발 환경 구축 및 실행 방법은 **[로컬 개발 가이드](./docs/development.md)**를 참고하세요.

### Quick Run
```bash
# 1. 의존성 설치
pnpm install

# 2. Supabase 로컬 개발 서버 실행
pnpm supabase start

# 3. 전체 애플리케이션 실행 (Turbo)
pnpm dev
```

---

## 📚 Documentation Index

상세 설계 및 정책은 `docs/` 디렉토리의 문서들을 확인해 주세요.

- [전체 문서 인덱스](./docs/README.md)
- [기술 스택 및 규칙 (CONVENTIONS.md)](./CONVENTIONS.md)
- [데이터베이스 스키마](./docs/database_schema.md)
- [인증 및 세션 정책](./docs/extension_auth_flow.md)

---
© 2026 Pickle Team. All rights reserved.

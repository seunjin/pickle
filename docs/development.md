# 💻 로컬 개발 가이드 (Local Development Guide)

이 문서는 Pickle 프로젝트를 로컬 환경에서 구동하고 개발하기 위한 절차를 안내합니다.

---

## 1. 사전 준비 (Prerequisites)

- **Node.js**: v20 이상 권장
- **Package Manager**: `pnpm` (필수)
  ```bash
  corepack enable pnpm
  ```

---

## 2. 프로젝트 설정 (Setup)

### 의존성 설치
루트 디렉토리에서 아래 명령어를 실행합니다.
```bash
pnpm install
```

### 환경 변수 설정
각 앱의 `.env.example` 파일을 복사하여 `.env` 파일을 생성하고 필요한 값을 입력합니다.

- **Web**: `apps/web/.env`
- **Extension**: `apps/extension/.env`

---

## 3. 웹 대시보드 실행 (Web App)

```bash
pnpm --filter web dev
```
- 접속 주소: `http://localhost:3000`

---

## 4. 익스텐션 실행 및 개발 (Extension)

### 빌드 및 감시 모드
```bash
pnpm --filter extension dev
```
- `apps/extension/dist` 폴더에 빌드 결과물이 생성됩니다.

### 브라우저에 로드하기
1. Chrome 주소창에 `chrome://extensions` 입력
2. 우측 상단 **개발자 모드** 활성화
3. **압축해제된 확장 프로그램을 로드합니다** 버튼 클릭
4. `apps/extension/dist` 폴더 선택

---

## 5. 익스텐션 인증 설정 (자동화 완료 🔑)

`manifest.json`에 공용 개발 키(`key`)를 추가하고, `vite.config.ts`에서 빌드 시 이를 처리하도록 자동화했습니다. 이제 모든 개발 환경에서 익스텐션 ID가 **`pgbkfbhojodldapigoomjkglijnbjlkf`**로 고정됩니다.

### 5.1 고정된 설정 정보
- **익스텐션 ID**: `pgbkfbhojodldapigoomjkglijnbjlkf`
- **Redirect URL**: `https://pgbkfbhojodldapigoomjkglijnbjlkf.chromiumapp.org/`
- **인증 설정**: 로컬 수퍼베이스(`supabase/config.toml`)에 위 주소가 이미 등록되어 있어 별도의 추가 설정 없이 로그인을 테스트할 수 있습니다.

### 5.2 크롬 웹스토어 배포(심사) 시 유의사항
- 크롬 웹스토어는 심사 제출용 ZIP 파일에 `key` 필드가 포함되는 것을 권장하지 않거나 거절 사유로 삼기도 합니다.
- **배포용 빌드 방법**: 심사 제출용 파일을 만들 때는 아래와 같이 환경 변수를 추가하여 빌드합니다.
  ```bash
  VITE_WEBSTORE_BUILD=true pnpm build:extension
  ```
- 이 명령을 사용하면 `key` 필드가 제거된 배포판이 `dist` 폴더에 생성됩니다. 일반적인 개발용 빌드(`pnpm build:extension`) 시에는 아이디 유지를 위해 `key`가 포함됩니다.

---

## 6. 일반적인 문제 해결 (Troubleshooting)

### 로그인 시 "Invalid Redirect URL" 에러가 발생할 때
- Supabase에 등록한 익스텐션 ID와 현재 브라우저에 설치된 ID가 일치하는지 다시 확인하세요.
- 익스텐션을 삭제 후 다시 로드하면 ID가 바뀔 수 있으니 주의하세요.

---

## 7. 가이드라인 및 컨벤션
- 코드 작성 전 [CONVENTIONS.md](../CONVENTIONS.md)를 반드시 숙독하시기 바랍니다.

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

## 5. 익스텐션 인증 설정 (중요 🔑)

`manifest.json`에서 `key` 필드를 제거했기 때문에, 로컬 환경마다 익스텐션 ID가 달라집니다. 로그인을 정상적으로 사용하려면 아래 설정을 완료해야 합니다.

### 5.1 익스텐션 ID 확인
1. `chrome://extensions` 페이지에서 Pickle 익스텐션의 **ID**를 복사합니다. (예: `nkpml...`)

### 5.2 Supabase Redirect URL 등록
1. [Supabase Dashboard](https://supabase.com/dashboard) > 프로젝트 선택
2. **Authentication** > **URL Configuration** 이동
3. **Redirect URLs** 섹션에 아래 형식의 URL을 추가합니다.
   ```text
   https://<익스텐션ID>.chromiumapp.org/
   ```
   *예: `https://nkpml...chromiumapp.org/`*

### 5.3 OAuth 설정 확인
- Google Cloud Console의 OAuth 동의 화면에 해당 익스텐션 URL이 허용되어 있는지 확인이 필요할 수 있습니다. (기본적으로 Supabase가 중계하므로 Supabase에만 등록하면 대부분 해결됩니다.)

---

## 6. 일반적인 문제 해결 (Troubleshooting)

### 로그인 시 "Invalid Redirect URL" 에러가 발생할 때
- Supabase에 등록한 익스텐션 ID와 현재 브라우저에 설치된 ID가 일치하는지 다시 확인하세요.
- 익스텐션을 삭제 후 다시 로드하면 ID가 바뀔 수 있으니 주의하세요.

---

## 7. 가이드라인 및 컨벤션
- 코드 작성 전 [CONVENTIONS.md](../CONVENTIONS.md)를 반드시 숙독하시기 바랍니다.

# 디자인 시스템 토큰 가이드 (Design System Tokens)

본 문서는 Figma에서 디자인 토큰을 추출하여 프로젝트의 CSS 변수로 변환하는 워크플로우를 설명합니다.

## 1. 개요 (Overview)

우리 프로젝트는 **OKLCH** 색상 공간을 기반으로 한 CSS 변수를 사용합니다.
Figma에서 관리되는 디자인 토큰을 JSON 형태로 추출한 뒤, 스크립트를 통해 자동으로 CSS 파일로 변환합니다.

- **Source**: Figma (Luckino 플러그인 사용)
- **Input**: `packages/ui/src/token.json`
- **Script**: `packages/ui/scripts/generate-tokens.js`
- **Output**: `packages/ui/src/token.css`

---

## 2. 워크플로우 (Workflow)

### Step 1. Figma에서 토큰 추출
1. Figma에서 **Luckino (또는 호환되는 플러그인)**을 실행합니다.
2. 디자인 토큰을 **JSON** 포맷으로 export 합니다.
3. 추출된 JSON 데이터는 다음과 같은 구조를 가져야 합니다:
   ```json
   {
     "light": {
       "background": { "$value": "#ffffff", "$type": "color" },
       ...
     },
     "dark": {
       "background": { "$value": "#000000", "$type": "color" },
       ...
     }
   }
   ```

### Step 2. JSON 파일 업데이트
프로젝트의 다음 경로에 있는 파일에 추출한 JSON 내용을 덮어씁니다:
- **경로**: `packages/ui/src/token.json`

### Step 3. 변환 스크립트 실행
터미널(Root 경로)에서 다음 명령어를 실행합니다:

```bash
pnpm token
```

이 명령어는 내부적으로 `node packages/ui/scripts/generate-tokens.js`를 실행합니다.

### Step 4. 결과 확인
스크립트 실행이 완료되면 다음 파일이 갱신됩니다:
- **경로**: `packages/ui/src/token.css`

**자동 변환 기능:**
- 입력된 **Hex** 색상 값은 자동으로 모던 웹 표준 색상 공간인 **OKLCH** 포맷으로 변환됩니다.
- 예: `#72e3ad` → `oklch(0.83477 0.13016 160.908)`

---

## 3. 파일 구조 및 역할

| 파일 경로 | 역할 | 비고 |
| :--- | :--- | :--- |
| `packages/ui/src/token.json` | **(Input)** 디자인 토큰 원본 데이터 | Figma에서 추출하여 붙여넣기 |
| `packages/ui/src/token.css` | **(Output)** 실제 사용되는 CSS 변수 | **수동 수정 금지** (스크립트로 생성됨) |
| `packages/ui/scripts/generate-tokens.js` | **(Script)** 변환 로직 (Hex → OKLCH) | JSON 파싱 및 CSS 생성 담당 |

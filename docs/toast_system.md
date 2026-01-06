# Toast 알림 시스템 (Toast Notification System)

이 문서는 `@pickle/ui` 패키지의 Toast 알림 시스템 사용법을 설명합니다.

## 1. 개요 (Overview)

Toast 시스템은 **Sonner** 라이브러리를 기반으로 하며, Pickle 디자인 시스템에 맞게 커스터마이징되었습니다.

- **기반**: [Sonner](https://sonner.emilkowal.ski/) (React Toast 라이브러리)
- **위치**: `packages/ui/src/toast/`
- **스타일**: 디자인 토큰 기반 CSS (`toast.css`)

## 2. 설치 및 설정 (Setup)

### Toaster 컴포넌트 등록
루트 레이아웃에 `Toaster` 컴포넌트를 추가합니다.

```tsx
// apps/web/src/app/layout.tsx
import { Toaster } from "@pickle/ui";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
```

---

## 3. 기본 사용법 (Basic Usage)

### toast 객체 직접 사용

```tsx
import { toast } from "@pickle/ui";

// 정보 알림
toast.info({ title: "알림 메시지" });

// 성공 알림
toast.success({ title: "저장이 완료되었습니다!" });

// 에러 알림
toast.error({ title: "저장에 실패했습니다." });

// 로딩 알림
toast.loading({ title: "저장 중..." });
```

### useToast Hook 사용

```tsx
import { useToast } from "@pickle/ui";

function MyComponent() {
  const toast = useToast();
  
  const handleClick = () => {
    toast.success({ title: "성공!" });
  };
  
  return <button onClick={handleClick}>저장</button>;
}
```

---

## 4. Toast 종류 (Toast Kinds)

| 종류 | 용도 | 아이콘 |
|:---|:---|:---|
| `info` | 일반 정보 전달 | ℹ️ `info_circle_16` |
| `success` | 성공 알림 | ✓ `check_circle_16` |
| `error` | 오류 알림 | ⚠️ `error_circle_16` |
| `loading` | 진행 중 상태 | 🔄 `Spinner` |

---

## 5. 고급 옵션 (Advanced Options)

### ToastProps 상세

```typescript
type ToastProps = {
  title: string;           // 필수: 메인 메시지
  description?: string;    // 부가 설명
  durationMs?: number;     // 자동 닫힘 시간 (ms)
  dismissible?: boolean;   // X 버튼 표시 여부 (기본: true)
  action?: ToastAction;    // 액션 버튼
  cancel?: ToastAction;    // 취소 버튼
  dedupeKey?: string;      // 중복 방지 키
};

type ToastAction = {
  label: string;
  onClick: () => void | Promise<void>;
};
```

### 예시: 액션 버튼 추가

```tsx
toast.info({
  title: "변경 사항이 있습니다",
  description: "저장하지 않으면 변경 내용이 사라집니다.",
  action: {
    label: "저장하기",
    onClick: () => saveChanges(),
  },
  cancel: {
    label: "취소",
    onClick: () => console.log("취소됨"),
  },
});
```

---

## 6. Promise 연동 (Promise Integration)

비동기 작업의 상태를 자동으로 표시합니다.

```tsx
const saveNote = async () => {
  const result = await toast.promise(
    api.saveNote(noteData), // 비동기 함수
    {
      loading: "저장 중...",
      success: "저장되었습니다!",
      error: "저장에 실패했습니다.",
    }
  );
  return result;
};
```

**동작 흐름:**
1. `loading` 토스트 표시
2. Promise 완료 시 `success` 또는 `error`로 자동 전환
3. 성공 시 3초, 실패 시 5초 후 자동 닫힘

---

## 7. Undo (실행 취소) 패턴

삭제 등 되돌릴 수 있는 작업에 사용합니다.

```tsx
const handleDelete = async (noteId: string) => {
  await deleteNote(noteId);
  
  toast.undo({
    title: "노트가 삭제되었습니다",
    onUndo: async () => {
      await restoreNote(noteId);
    },
    onUndoSuccessTitle: "노트가 복구되었습니다",
  });
};
```

---

## 8. Toast 제어 (Manual Control)

```tsx
// 특정 ID로 생성
const id = toast.loading({ 
  title: "업로드 중...",
  dedupeKey: "upload-toast" 
});

// 업데이트
toast.update(id, {
  kind: "success",
  title: "업로드 완료!",
  durationMs: 3000,
});

// 개별 닫기
toast.dismiss(id);

// 모두 닫기
toast.clearAll();
```

---

## 9. 아키텍처 (Architecture)

```
packages/ui/src/toast/
├── index.tsx       # toast API, createToast, useToast
├── types.ts        # ToastKind, ToastProps, ToastAction 타입
├── Toaster.tsx     # Sonner 래퍼 컴포넌트
├── ToastCard.tsx   # 커스텀 Toast UI 컴포넌트
└── toast.css       # 디자인 토큰 기반 스타일
```

### 중요한 설계 결정

1. **인스턴스 단일화**: 모노레포 환경에서 sonner 인스턴스 파편화 방지
2. **명시적 ID**: `crypto.randomUUID()` 사용으로 ID 충돌 방지
3. **순환 참조 방지**: `index.tsx(API) → ToastCard(UI)` 단방향 의존성

---

## 10. 스타일 커스터마이징

Toast 스타일은 `toast.css`에서 관리됩니다. 수정이 필요한 경우:

```css
/* packages/ui/src/toast/toast.css */
.pickle-toast-card {
  /* 기본 카드 스타일 */
}

.pickle-toast-success {
  /* 성공 상태 스타일 */
}

.pickle-toast-error {
  /* 에러 상태 스타일 */
}
```

> **⚠️ 주의**: 디자인 토큰(`token.css`)의 CSS 변수를 활용하세요.

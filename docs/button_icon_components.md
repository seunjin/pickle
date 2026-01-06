# Button & Icon 컴포넌트 가이드 (Button & Icon Components)

이 문서는 `@pickle/ui` 패키지의 Button 컴포넌트와 `@pickle/icons` 패키지의 Icon 사용법을 설명합니다.

## 1. 개요 (Overview)

Button 시스템은 **역할에 따라 두 가지 컴포넌트로 분리**되어 있습니다:

| 컴포넌트 | 용도 | 아이콘 |
|:---|:---|:---|
| `Button` | 일반 버튼 (텍스트 + 아이콘) | 선택적 |
| `ActionButton` | 아이콘 전용 버튼 (툴바, 액션) | 필수 |

### 기술 스택
- **cva (class-variance-authority)**: Variant 기반 스타일 관리
- **Radix UI Slot**: `asChild` prop으로 컴포넌트 합성
- **@pickle/icons**: 타입 안전한 아이콘 시스템

---

## 2. Button 컴포넌트

### 기본 사용법

```tsx
import { Button } from "@pickle/ui";

// Primary (기본)
<Button>저장</Button>

// Secondary
<Button variant="secondary">취소</Button>

// 아이콘 포함
<Button icon="arrow_right_16" iconSide="right">
  다음
</Button>
```

### Variants

```typescript
const buttonVariants = {
  variant: {
    primary: "기본 녹색 버튼",
    secondary: "회색 배경 버튼",
    icon: "아이콘 전용 (ActionButton 권장)",
  },
  size: {
    h38: "높이 38px (기본)",
    h32: "높이 32px",
  },
};
```

### Props

```typescript
type ButtonProps = {
  variant?: "primary" | "secondary" | "icon";
  size?: "h38" | "h32";
  icon?: IconName;           // 아이콘 이름
  iconSide?: "left" | "right"; // 아이콘 위치 (기본: right)
  asChild?: boolean;         // Slot 패턴 사용
  disabled?: boolean;
  // + 모든 button HTML 속성
};
```

### asChild 패턴 (Link와 조합)

```tsx
import Link from "next/link";
import { Button } from "@pickle/ui";

<Button asChild>
  <Link href="/dashboard">대시보드로 이동</Link>
</Button>
```

---

## 3. ActionButton 컴포넌트

**아이콘만 표시하는 작은 버튼**입니다. 툴바, 닫기 버튼, 펼침/접힘 토글 등에 사용합니다.

### 기본 사용법

```tsx
import { ActionButton } from "@pickle/ui";

// 기본 액션
<ActionButton icon="delete_16" onClick={handleDelete} />

// 포커스 상태 강제
<ActionButton icon="more_16" forceFocus={true} />

// 접근성 레이블
<ActionButton icon="close_16" aria-label="닫기" />
```

### Variants

ActionButton은 **compoundVariants 패턴**을 사용하여 `variant`와 `forceFocus` 조합에 따라 스타일이 결정됩니다.

| variant | forceFocus | 설명 |
|:---|:---|:---|
| `action` | `false` | 기본 상태, hover 시 배경 표시 |
| `action` | `true` | 항상 배경 표시 (메뉴 열린 상태 등) |
| `subAction` | `false` | 평소 숨김, 부모 hover 시 표시 |
| `subAction` | `true` | 항상 표시 |

### Props

```typescript
type ActionButtonProps = {
  icon: IconName;              // 필수: 아이콘 이름
  variant?: "action" | "subAction";
  forceFocus?: boolean;        // 포커스 상태 강제
  asChild?: boolean;
  // children은 허용되지 않음 (아이콘 전용)
};
```

### subAction 사용 예시

리스트 아이템에서 hover 시에만 나타나는 액션 버튼:

```tsx
<div className="group flex items-center">
  <span>노트 제목</span>
  <ActionButton 
    variant="subAction" 
    icon="more_16" 
    className="ml-auto"
  />
</div>
```

---

## 4. Icon 컴포넌트

`@pickle/icons` 패키지에서 제공하는 타입 안전한 아이콘 시스템입니다.

### 기본 사용법

```tsx
import { Icon } from "@pickle/icons";

// 기본 사용
<Icon name="search_20" />

// 색상 변경 (currentColor 활용)
<Icon name="check_circle_16" className="text-system-success" />

// 크기 조절
<Icon name="layout_20" className="size-6" />
```

### 아이콘 명명 규칙

```
{아이콘명}_{사이즈}
```

예시:
- `search_20` - 20px 검색 아이콘
- `note_full_16` - 16px 채워진 노트 아이콘
- `check_circle_16` - 16px 체크 원 아이콘

### 타입 안전성

IconName 타입은 자동 생성되어, 존재하지 않는 아이콘 이름 사용 시 컴파일 에러가 발생합니다.

```tsx
// ✅ 정상
<Icon name="search_20" />

// ❌ 타입 에러: "search_99"는 존재하지 않음
<Icon name="search_99" />
```

---

## 5. 접근성 (Accessibility)

### ActionButton 필수 사항

아이콘 전용 버튼은 **반드시 `aria-label`을 제공**해야 합니다.

```tsx
// ❌ 접근성 문제
<ActionButton icon="delete_16" />

// ✅ 올바른 사용
<ActionButton icon="delete_16" aria-label="삭제" />
```

### Button with Icon

텍스트가 있는 Button은 별도의 aria-label이 필요 없습니다.

```tsx
// ✅ 텍스트가 있으므로 OK
<Button icon="download_16">다운로드</Button>
```

---

## 6. 스타일 확장

### className으로 확장

```tsx
<Button className="w-full">전체 너비 버튼</Button>

<ActionButton 
  icon="more_16" 
  className="hover:bg-red-500/20" 
/>
```

### 커스텀 Variant 추가

`buttonVariants` 또는 `actionButtonVariants`를 확장하려면:

```typescript
// packages/ui/src/button/Button.tsx
const buttonVariants = cva(/* ... */, {
  variants: {
    variant: {
      primary: /* ... */,
      secondary: /* ... */,
      danger: cn(  // 새 variant 추가
        "bg-system-error text-white",
        "hover:bg-red-600",
      ),
    },
  },
});
```

---

## 7. 체크리스트 (Checklist)

- [ ] 텍스트 + 아이콘 조합은 `Button` 컴포넌트를 사용합니다.
- [ ] 아이콘만 있는 버튼은 `ActionButton` 컴포넌트를 사용합니다.
- [ ] `ActionButton`에는 반드시 `aria-label`을 제공합니다.
- [ ] 아이콘 이름은 타입 추론을 활용하여 정확한 이름을 사용합니다.
- [ ] hover 시에만 표시되는 액션 버튼은 `variant="subAction"`을 사용합니다.

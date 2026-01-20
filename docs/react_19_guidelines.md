# React 19 가이드라인 및 프로젝트 규칙

이 문서는 React 19에 새로 도입된 기능과 훅들을 우리 프로젝트에서 어떻게 활용할지에 대한 규칙을 정의합니다.

## 1. 새로운 Hook (New Hooks)

### `use(Promise | Context)`
- **설명**: Promise나 Context의 값을 컴포넌트 내부에서 읽어옵니다. `useContext`보다 유연하며 조건문 안에서도 호출 가능합니다.
- **사용 규칙**:
  - **데이터 페칭**: 비동기 데이터를 컴포넌트에서 직접 기다릴 때 Suspense와 함께 사용합니다.
  - **Context**: 조건부 렌더링 내에서 Context가 필요할 때 사용합니다.
- **예시**:
  ```tsx
  const note = use(fetchNotePromise);
  const theme = use(ThemeContext);
  ```

### `useActionState` (구 `useFormState`)
- **설명**: 폼 액션(Server Actions 등)의 결과 상태(데이터, 에러, 로딩 여부)를 관리합니다.
- **사용 규칙**:
  - API 호출이나 복잡한 폼 제출 로직의 상태 관리를 위해 `useState` 대신 우선적으로 고려합니다.
- **예시**:
  ```tsx
  const [state, formAction, isPending] = useActionState(submitAction, initialState);
  ```

### `useFormStatus`
- **설명**: 부모 `<form>`의 현재 제출 상태(pending 여부)를 자식 컴포넌트에서 구독합니다.
- **사용 규칙**:
  - 제출 버튼(`SubmitButton`) 컴포넌트에서 로딩 스피너를 보여줄 때 `props` 전달 없이 사용합니다.
- **예시**:
  ```tsx
  const { pending } = useFormStatus();
  ```

### `useOptimistic`
- **설명**: 비동기 작업이 완료되기 전에 UI를 미리 업데이트하여 반응성을 높입니다.
- **사용 규칙**:
  - 댓글 작성, 좋아요 버튼, 북마크 등 즉각적인 피드백이 중요한 UX에서 필수적으로 사용합니다.
  - **React Query와의 연동**: `useOptimistic`은 로컬 컴포넌트의 즉각적인 반응을 담당하고, `useMutation`의 `onMutate`는 앱 전체 캐시의 정합성을 담당합니다.
- **예시 (북마크 버튼)**:
  ```tsx
  const [optimisticActive, setOptimisticActive] = useOptimistic(
    active,
    (_, nextStatus: boolean) => nextStatus,
  );

  const handleToggle = () => {
    const nextStatus = !optimisticActive;
    
    // 1. UI 즉시 반영 (리액트가 관리)
    startTransition(() => {
      setOptimisticActive(nextStatus);
    });
    
    // 2. 서버 및 전역 캐시 업데이트 (React Query가 관리)
    updateNote({ noteId, payload: { bookmarked_at: nextStatus ? ... : null } });
  };
  ```
  > [!TIP]
  > `useOptimistic`은 반드시 `startTransition` 또는 `Action` 내부에서 사용해야 리액트 엔진이 상태를 올바르게 추적합니다.

### `useEffectEvent`
- **설명**: `useEffect` 내부에서 반응형 값(state, props)을 읽어야 하지만, 그 값의 변경이 Effect를 재실행시키지 않기를 원할 때 사용합니다.
- **사용 규칙**:
  - **이벤트 핸들러 격리**: Effect 로직과 이벤트 로직을 분리할 때 사용합니다.
  - **Linter 경고 해결**: `eslint-disable`이나 불필요한 의존성을 추가하지 말고 이 훅을 사용하세요.
- **예시**:
  ```tsx
  const onConnected = useEffectEvent(() => logConnection(roomId, theme));
  useEffect(() => {
    connection.on('connected', onConnected);
  }, [connection]);
  ```

---

## 2. 주요 변경 사항 (Core Features)

### `ref`를 Prop으로 전달 가능
- **설명**: 더 이상 `forwardRef` HOC를 사용할 필요가 없습니다. `ref`를 일반 `prop`처럼 전달받으세요.
- **예시**:
  ```tsx
  function MyInput({ placeholder, ref }) {
    return <input placeholder={placeholder} ref={ref} />;
  }
  ```

### `<Context>`를 Provider로 사용
- **설명**: `<Context.Provider value={...}>` 대신 `<Context value={...}>`로 간소화되었습니다.
- **예시**:
  ```tsx
  <ThemeContext value="dark">
    {children}
  </ThemeContext>
  ```

### Server Components & Actions
- **설명**: Next.js (Web App)에서는 기본적으로 서버 컴포넌트를 지향하고, 클라이언트 상호작용이 필요한 경우에만 `'use client'`를 명시합니다.

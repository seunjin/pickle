# Query Factory 패턴 가이드 (Query Factory Pattern)

이 문서는 React Query의 Query Factory 패턴을 사용하여 데이터 페칭을 관리하는 방법을 설명합니다.

## 1. 개요 (Overview)

**Query Factory 패턴**은 Query Key와 Query Function을 한 곳에서 정의하고 관리하는 패턴입니다.
Custom Hook으로 감싸지 않고, 컴포넌트에서 `useSuspenseQuery`와 함께 **직접 사용**하는 것을 표준으로 합니다.

### 왜 Wrapper Hook을 지양하는가?

| 방식 | 문제점 |
|:---|:---|
| `useGetNotes()` (Wrapper Hook) | 내부 구현이 숨겨져 `select`, `refetchInterval` 등 옵션 확장이 어려움 |
| `useSuspenseQuery(noteQueries.all())` | React Query의 모든 옵션을 컴포넌트 레벨에서 자유롭게 사용 가능 |

---

## 2. 파일 구조 (File Structure)

```
features/<feature-name>/
├── api/
│   └── getNotes.ts         # Supabase 호출 로직 (Service Layer)
├── model/
│   └── noteQueries.ts      # Query Factory 정의
└── ui/
    └── NoteList.tsx        # useSuspenseQuery 직접 사용
```

---

## 3. Query Factory 정의

### noteQueries.ts 예시

```typescript
// features/note/model/noteQueries.ts
import { queryOptions } from "@tanstack/react-query";
import { getNotes } from "../api/getNotes";
import { getNote } from "../api/getNote";

/**
 * Query Key 정의
 * - 계층적 구조로 캐시 무효화를 쉽게 관리
 * - `as const`로 리터럴 타입 유지
 */
export const noteKeys = {
  all: ["notes"] as const,
  lists: () => [...noteKeys.all, "list"] as const,
  detail: (id: string) => [...noteKeys.all, "detail", id] as const,
};

/**
 * Query Factory
 * - queryOptions()로 타입 안전한 옵션 객체 생성
 * - Server/Client 모두에서 동일하게 사용 가능
 */
export const noteQueries = {
  all: () =>
    queryOptions({
      queryKey: noteKeys.all,
      queryFn: () => getNotes(),
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: noteKeys.detail(id),
      queryFn: () => getNote(id),
    }),
};
```

---

## 4. 컴포넌트에서 사용

### Client Component

```tsx
// features/note/ui/NoteList.tsx
"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { noteQueries } from "../model/noteQueries";

export function NoteList() {
  // ✅ Query Factory 직접 사용
  const { data: notes } = useSuspenseQuery(noteQueries.all());

  return (
    <div>
      {notes.map(note => <NoteCard key={note.id} note={note} />)}
    </div>
  );
}
```

### 옵션 확장 예시

```tsx
// 즐겨찾기 노트만 필터링
const { data: favoriteNotes } = useSuspenseQuery({
  ...noteQueries.all(),
  select: (notes) => notes.filter(n => n.favorite),
});

// 5초마다 자동 갱신
const { data } = useSuspenseQuery({
  ...noteQueries.all(),
  refetchInterval: 5000,
});
```

---

## 5. Server Component에서 Prefetch

```tsx
// app/(client)/dashboard/page.tsx
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/shared/lib/react-query/getQueryClient";
import { getNotes } from "@/features/note/api/getNotes";
import { createClient } from "@/shared/lib/supabase/server";
import { noteKeys } from "@/features/note/model/noteQueries";

export default async function DashboardPage() {
  const supabase = await createClient();
  const queryClient = getQueryClient();

  // Server에서 데이터 Prefetch
  await queryClient.prefetchQuery({
    queryKey: noteKeys.all,
    queryFn: () => getNotes(supabase),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<Loading />}>
        <NoteList />
      </Suspense>
    </HydrationBoundary>
  );
}
```

---

## 6. Mutation과 낙관적 업데이트

뮤테이션 수행 시, 관련 쿼리를 단순히 무효화(`invalidateQueries`)하는 것을 넘어 사용자 경험을 위해 **낙관적 업데이트(Optimistic Update)**를 구현하는 것을 권장합니다.

### 추천 패턴: 전용 Mutation 훅 + 공용 유틸리티

```tsx
// features/note/model/useUpdateNoteMutation.ts
import { updateCacheItem } from "@/shared/lib/react-query/optimistic";

export function useUpdateNoteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteId, payload }) => updateNote(noteId, payload),
    onMutate: async ({ noteId, payload }) => {
      // 1. 진행 중인 쿼리 취소
      await queryClient.cancelQueries({ queryKey: noteKeys.all });
      
      // 2. 이전 데이터 스냅샷
      const previousData = queryClient.getQueriesData({ queryKey: noteKeys.all });

      // 3. ✅ 캐시 아이템 업데이트 유틸리티 사용 (타입 안전)
      queryClient.setQueriesData({ queryKey: noteKeys.all }, (old) => 
        updateCacheItem<NoteWithAsset>(old, noteId, payload)
      );

      return { previousData };
    },
    onError: (_err, _vars, context) => {
      // 4. 에러 시 롤백
      if (context?.previousData) {
        for (const [key, data] of context.previousData) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: () => {
      // 5. 서버와 동기화
      queryClient.invalidateQueries({ queryKey: noteKeys.all });
    },
  });
}
```

---

## 7. Query Key 계층 구조

Query Key는 계층적으로 설계하여 캐시 무효화를 효율적으로 관리합니다.

```typescript
export const noteKeys = {
  all: ["notes"] as const,                           // 모든 노트 관련
  lists: () => [...noteKeys.all, "list"] as const,   // 목록 쿼리들
  detail: (id: string) => [...noteKeys.all, "detail", id] as const,
};

// 사용 예시
queryClient.invalidateQueries({ queryKey: noteKeys.all });
// → ["notes"], ["notes", "list"], ["notes", "detail", "123"] 모두 무효화

queryClient.invalidateQueries({ queryKey: noteKeys.detail("123") });
// → ["notes", "detail", "123"]만 무효화
```

---

## 8. 언제 Custom Hook을 사용하는가?

**Query Factory 직접 사용이 원칙**이지만, 다음 경우에는 Custom Hook이 허용됩니다:

| 허용 케이스 | 예시 |
|:---|:---|
| 복잡한 비즈니스 로직 포함 | 여러 쿼리 조합, 복잡한 데이터 변환 |
| Mutation + 후처리 로직 | `useCreateNote`, `useDeleteNote` |
| 여러 컴포넌트에서 동일한 로직 재사용 | 상태 + 핸들러 묶음 |

```tsx
// ✅ 허용: Mutation + 후처리
export function useDeleteNote() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.all });
      toast.success({ title: "삭제되었습니다." });
    },
    onError: () => {
      toast.error({ title: "삭제에 실패했습니다." });
    },
  });
}
```

---

## 9. 체크리스트 (Checklist)

- [ ] Query Factory는 `features/<feature>/model/` 폴더에 위치합니다.
- [ ] Query Key는 `as const`로 리터럴 타입을 유지합니다.
- [ ] 단순 조회는 `useSuspenseQuery` + Query Factory를 직접 사용합니다.
- [ ] Server Component에서는 `prefetchQuery`로 미리 데이터를 가져옵니다.
- [ ] Mutation 후에는 반드시 관련 Query를 `invalidateQueries`로 무효화합니다.

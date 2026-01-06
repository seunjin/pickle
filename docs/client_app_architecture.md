# Client Application Architecture Patterns

(client) 라우트 그룹 내의 페이지들(대시보드, 설정 등)은 **풍부한 상호작용**과 **즉각적인 반응성**이 핵심입니다. 이를 위해 **SSR Prefetching + React Query Hydration** 패턴을 표준으로 채택합니다.

## 🎯 Core Concept
- **Faster Initial Load**: 서버에서 초기 데이터를 미리 가져와(Prefetch) 깜빡임 없는(Zero Layout Shift) 첫 화면을 제공합니다.
- **Client-Side Interactivity**: 클라이언트에서는 React Query가 데이터를 Hydrate하여 즉시 제어권을 가집니다.
- **Optimistic Updates**: 사용자 액션(삭제, 수정)에 대해 서버 응답을 기다리지 않고 UI를 선제적으로 업데이트하여 앱 같은 경험을 제공합니다.

## 🏗️ Implementation Pattern

### 1. Server Component (`page.tsx`)
**역할**: 데이터 Fetching, SEO 메타데이터, 초기 상태 주입

```tsx
// app/(client)/dashboard/page.tsx
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/shared/lib/react-query/getQueryClient";
import { getNotes } from "@/features/note/api/getNotes";
import { createClient } from "@/shared/lib/supabase/server";
import { NoteList } from "@/features/note";

export default async function Page() {
  const supabase = await createClient(); // 1. Server Client 생성
  const queryClient = getQueryClient();  // 2. Server QueryClient 생성

  // 3. Prefetch Data (Server-Side)
  await queryClient.prefetchQuery({
    queryKey: ["notes"],
    queryFn: () => getNotes(supabase), // 의존성 주입
  });

  return (
    // 4. Hydration & Suspense
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<div>Loading...</div>}>
         <NoteList /> {/* Client Component */}
      </Suspense>
    </HydrationBoundary>
  );
}
```

### 2. API Function (Service Layer)
**역할**: 서버/클라이언트 양쪽에서 재사용 가능한 API 로직
- `SupabaseClient`를 주입받아 Context(Server Cookie vs Browser Session)에 맞게 동작해야 합니다.

```typescript
// features/note/api/getNotes.ts
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/shared/lib/supabase/client";

export const getNotes = async (client?: SupabaseClient) => {
  // 인자로 클라이언트를 받으면(Server) 그것을 사용, 없으면(Client) 기본 브라우저 클라이언트 사용
  const supabase = client ?? createClient(); 
  
  const { data } = await supabase.from("notes").select("*");
  return data;
};
```

### 3. Client Component (`NoteList.tsx`)
**역할**: UI 렌더링, 상태 구독, 이벤트 핸들링
- `useSuspenseQuery`를 사용하지만, 이미 데이터가 Hydrate되어 있어 `isLoading` 상태 없이 즉시 데이터를 표시합니다.

```tsx
// features/note/ui/NoteList.tsx
"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { noteQueries } from "../model/noteQueries";

export function NoteList() {
  // Query Factory를 직접 사용 (이미 Prefetch된 데이터가 있어 즉시 data가 반환됨)
  const { data: notes } = useSuspenseQuery(noteQueries.all());
  
  return (
    <div>
      {notes.map(note => <NoteCard key={note.id} note={note} />)}
    </div>
  );
}
```


## 🎣 Data Fetching Strategy (Query Factory Pattern)

우리는 데이터 페칭 시 **Custom Hook(`useGetNotes`)으로 감싸는 것을 지양**하고, **Query Factory**를 통해 정의된 Key와 Option을 컴포넌트에서 **직접 사용**하는 것을 표준으로 합니다.

> **⚠️ 중요**: Wrapper Hook(`useNote`, `useGetNotes` 등) 대신 Query Factory + `useSuspenseQuery`를 직접 사용하세요.

### 1. Query Factory (`queries.ts`)
Query Key와 Fetcher 함수를 한곳에서 관리하여 Server/Client 간의 불일치를 방지합니다.

```typescript
// features/note/model/noteQueries.ts
import { queryOptions } from "@tanstack/react-query";

export const noteKeys = {
  all: ["notes"] as const,
  item: (id: string) => [...noteKeys.all, id] as const,
};

export const noteQueries = {
  all: () => queryOptions({
    queryKey: noteKeys.all,
    queryFn: () => getNotes(),
  }),
};
```

### 2. Direct Usage in Components
Wrapper Hook 없이 `useSuspenseQuery`를 직접 사용하여, React Query의 강력한 옵션(`select`, `refetchInterval` 등)을 컴포넌트 레벨에서 자유롭게 확장할 수 있도록 합니다.

```tsx
// features/note/ui/NoteList.tsx (O - 권장)
export function NoteList() {
  // ✅ 확장성: select 옵션 등을 자유롭게 추가 가능
  const { data } = useSuspenseQuery({
    ...noteQueries.all(),
    select: (notes) => notes.filter(n => n.favorite), 
  });
}

// (X - 비권장)
// ❌ 확장성 부족: 내부 구현이 숨겨져 있어 옵션 추가가 어려움
const { data } = useGetNotes(); 
```

## ✅ Checklist
- [ ] `page.tsx`는 항상 `async` Server Component여야 합니다.
- [ ] API 함수는 `SupabaseClient`를 선택적 인자로 받아야 합니다 (Dependency Injection).
- [ ] Client Component 최상단에 `"use client"` 지시어가 있어야 합니다.
- [ ] 데이터 변경(Mutation) 시에는 반드시 `invalidateQueries`나 `setQueryData`를 통해 캐시를 갱신해야 합니다.
- [ ] 단순 조회 로직은 Custom Hook으로 감싸지 말고 `noteQueries`를 직접 사용합니다.
- [ ] 복잡한 비즈니스 로직이 포함된 경우에만 제한적으로 Custom Hook을 사용합니다.

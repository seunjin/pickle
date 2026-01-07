import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { Suspense } from "react";
import { noteQueries } from "@/features/note/model/noteQueries";
import { NoteListWithFilter } from "@/features/note/ui/NoteListWithFilter";
import { getQueryClient } from "@/shared/lib/react-query/getQueryClient";
import { getSupabaseServerClient } from "@/shared/lib/supabase/serverSingleton";

export const metadata: Metadata = {
  title: "Dashboard | Pickle",
};

// ✅ 쿠키 기반 인증이므로 정적 렌더링 방지
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = await getSupabaseServerClient();
  const queryClient = getQueryClient();

  // ✅ Dashboard 페이지 특화 데이터 prefetch
  await queryClient.prefetchQuery(noteQueries.list({ client: supabase }));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex-1 overflow-auto p-6">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-16 text-base-muted">
              Loading notes...
            </div>
          }
        >
          <NoteListWithFilter />
        </Suspense>
      </div>
    </HydrationBoundary>
  );
}

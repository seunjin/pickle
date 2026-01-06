import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { Suspense } from "react";
import { noteQueries } from "@/features/note/model/noteQueries";
import { NoteListWithFilter } from "@/features/note/ui/NoteListWithFilter";
import { getQueryClient } from "@/shared/lib/react-query/getQueryClient";
import { createClient } from "@/shared/lib/supabase/server";

export const metadata: Metadata = {
  title: "Dashboard | Pickle",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const queryClient = getQueryClient();

  // 기본 목록 프리페치 (필터 없는 상태)
  await queryClient.prefetchQuery(noteQueries.list({ client: supabase }));

  return (
    <div className="flex-1 overflow-auto p-6">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-16 text-base-muted">
              Loading notes...
            </div>
          }
        >
          <NoteListWithFilter />
        </Suspense>
      </HydrationBoundary>
    </div>
  );
}

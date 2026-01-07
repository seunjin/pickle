import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { Suspense } from "react";
import { noteQueries } from "@/features/note/model/noteQueries";
import { NoteListWithFilter } from "@/features/note/ui/NoteListWithFilter";
import { getQueryClient } from "@/shared/lib/react-query/getQueryClient";
import { getSupabaseServerClient } from "@/shared/lib/supabase/serverSingleton";

export const metadata: Metadata = {
  title: "Bookmarks | Pickle",
};

export default async function BookmarksPage() {
  const supabase = await getSupabaseServerClient();
  const queryClient = getQueryClient();

  // Server에서 데이터 Prefetch (Bookmarks 전용)
  await queryClient.prefetchQuery(
    noteQueries.list({ client: supabase, filter: { onlyBookmarked: true } }),
  );

  return (
    <div className="flex-1 overflow-auto p-6">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-16 text-base-muted">
              Loading bookmarks...
            </div>
          }
        >
          <NoteListWithFilter onlyBookmarked={true} />
        </Suspense>
      </HydrationBoundary>
    </div>
  );
}

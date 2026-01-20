import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { Suspense } from "react";
import { noteQueries } from "@/features/note/model/noteQueries";
import { NoteListWithFilter } from "@/features/note/ui/NoteListWithFilter";
import { getQueryClient } from "@/shared/lib/react-query/getQueryClient";
import { createClient } from "@/shared/lib/supabase/server";

export const metadata: Metadata = {
  title: "Bookmarks | Pickle",
};

export default async function BookmarksPage() {
  const supabase = await createClient();
  const queryClient = getQueryClient();

  // Server에서 데이터 Prefetch 시작
  await queryClient.prefetchInfiniteQuery(
    noteQueries.listInfinite({
      client: supabase,
      filter: { onlyBookmarked: true },
    }),
  );

  return (
    <div className="h-full">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-16 text-base-muted">
              Loading bookmarks...
            </div>
          }
        >
          <NoteListWithFilter onlyBookmarked nodataType="bookmarks" />
        </Suspense>
      </HydrationBoundary>
    </div>
  );
}

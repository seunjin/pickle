import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { Suspense } from "react";
import { NoteList } from "@/features/note";
import { getNotes } from "@/features/note/api/getNotes";
import { noteKeys } from "@/features/note/model/noteQueries";
import { getQueryClient } from "@/shared/lib/react-query/getQueryClient";
import { createClient } from "@/shared/lib/supabase/server";

export const metadata: Metadata = {
  title: "Bookmarks | Pickle",
};

export default async function BookmarksPage() {
  const supabase = await createClient();
  const queryClient = getQueryClient();

  // Server에서 데이터 Prefetch (Bookmarks 전용)
  await queryClient.prefetchQuery({
    queryKey: noteKeys.bookmarks(),
    queryFn: () =>
      getNotes({ client: supabase, filter: { onlyBookmarked: true } }),
  });

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
          <NoteList onlyBookmarked={true} />
        </Suspense>
      </HydrationBoundary>
    </div>
  );
}

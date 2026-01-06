import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { Suspense } from "react";
import { NoteList } from "@/features/note";
import { getNotes } from "@/features/note/api/getNotes";
import { noteKeys } from "@/features/note/model/noteQueries";
import { getQueryClient } from "@/shared/lib/react-query/getQueryClient";
import { createClient } from "@/shared/lib/supabase/server";
import { ContentFilter } from "./ContentFilter";

export const metadata: Metadata = {
  title: "Dashboard | Pickle",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: noteKeys.all,
    queryFn: () => getNotes({ client: supabase }),
  });

  return (
    <div className="flex-1 overflow-auto p-6">
      <ContentFilter />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-16 text-base-muted">
              Loading notes...
            </div>
          }
        >
          <NoteList />
        </Suspense>
      </HydrationBoundary>
    </div>
  );
}

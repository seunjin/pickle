import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { Suspense } from "react";
import { NoteList } from "@/features/note";
import { getNotes } from "@/features/note/api/getNotes";
import { noteKeys } from "@/features/note/model/noteQueries";
import { getQueryClient } from "@/shared/lib/react-query/getQueryClient";
import { createClient } from "@/shared/lib/supabase/server";

export const metadata: Metadata = {
  title: "Dashboard | Pickle",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const queryClient = getQueryClient();
  // Prefetch data on the server
  await queryClient.prefetchQuery({
    queryKey: noteKeys.all,
    queryFn: () => getNotes(supabase),
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-bold text-3xl">Dashboard</h1>
      <div>
        <h2 className="mb-4 border-b pb-2 font-semibold text-xl">My Notes</h2>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <Suspense fallback={<div>Loading notes...</div>}>
            <NoteList />
          </Suspense>
        </HydrationBoundary>
      </div>
    </div>
  );
}

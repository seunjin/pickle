import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { noteQueries } from "@/features/note/model/noteQueries";
import { getQueryClient } from "@/shared/lib/react-query/getQueryClient";
import { createClient } from "@/shared/lib/supabase/server";
import { TrashContent } from "./TrashContent";

export default async function TrashPage() {
  const supabase = await createClient();
  const queryClient = getQueryClient();

  // 서버에서 데이터 프리페치 (Non-blocking)
  queryClient.prefetchQuery(noteQueries.trash(supabase));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TrashContent />
    </HydrationBoundary>
  );
}

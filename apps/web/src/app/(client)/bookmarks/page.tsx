import { Icon } from "@pickle/icons";
import { InputWithAddon } from "@pickle/ui";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { Suspense } from "react";
import { getServerAuth } from "@/features/auth/api/getServerAuth";
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
  const data = await getServerAuth();

  // Server에서 데이터 Prefetch (Bookmarks 전용)
  await queryClient.prefetchQuery({
    queryKey: noteKeys.bookmarks(),
    queryFn: () =>
      getNotes({ client: supabase, filter: { onlyBookmarked: true } }),
  });

  const avatar_url = data.appUser?.avatar_url;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="flex h-[60px] items-center justify-between border-base-border border-b px-10">
        <div>
          <h1 className="font-bold text-[20px] text-base-foreground leading-none">
            Bookmarks
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <InputWithAddon
            containerClassName="group w-90"
            placeholder="북마크 검색..."
            startAddon={
              <Icon
                name="search_20"
                className="transition-colors group-focus-within:text-base-primary"
              />
            }
          />

          {avatar_url && (
            <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-base-border">
              <img
                src={avatar_url}
                alt="Avatar"
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </div>
      </header>

      {/* Content */}
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
    </div>
  );
}

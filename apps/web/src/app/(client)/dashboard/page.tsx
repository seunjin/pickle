import { Icon } from "@pickle/icons";
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
  title: "Dashboard | Pickle",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const queryClient = getQueryClient();
  const data = await getServerAuth();
  await queryClient.prefetchQuery({
    queryKey: noteKeys.all,
    queryFn: () => getNotes(supabase),
  });
  const avatar_url = data.appUser?.avatar_url;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="flex h-[60px] items-center justify-between border-base-border border-b px-10">
        <div>
          {/* 페이지 제목 */}
          <h1 className="font-bold text-2xl text-base-foreground leading-none">
            Inbox
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* 검색바 */}
          <div className="relative">
            <input
              type="text"
              placeholder="검색..."
              className="w-64 rounded-lg border border-form-input-border bg-form-input-background py-2 pr-4 pl-10 text-form-input-foreground text-sm placeholder:text-form-input-placeholder focus:border-base-primary focus:outline-none"
            />
            {/* 검색 아이콘 placeholder */}
            <span className="-translate-y-1/2 absolute top-1/2 left-3 text-form-input-placeholder">
              <Icon name="search" size={"20"} />
            </span>
          </div>
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
                Loading notes...
              </div>
            }
          >
            <NoteList />
          </Suspense>
        </HydrationBoundary>
      </div>
    </div>
  );
}

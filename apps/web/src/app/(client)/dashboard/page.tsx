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

  await queryClient.prefetchQuery({
    queryKey: noteKeys.all,
    queryFn: () => getNotes(supabase),
  });

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-base-border border-b px-6 py-4">
        <div>
          {/* 페이지 제목 */}
          <h1 className="font-bold text-2xl text-base-foreground">Inbox</h1>
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
              🔍
            </span>
          </div>

          {/* 뷰 토글 (placeholder) */}
          <div className="flex items-center gap-1 rounded-lg border border-base-border p-1">
            <button
              type="button"
              className="rounded bg-base-foreground-background p-1.5 text-base-foreground"
              title="Grid View"
            >
              {/* Grid 아이콘 */}
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16">
                <title>Grid View</title>
                <path d="M1 2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V2zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V2zM1 7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V7zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V7zM1 12a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-2zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-2zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-2z" />
              </svg>
            </button>
            <button
              type="button"
              className="rounded p-1.5 text-base-muted hover:text-base-foreground"
              title="List View"
            >
              {/* List 아이콘 */}
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16">
                <title>List View</title>
                <path
                  fillRule="evenodd"
                  d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"
                />
              </svg>
            </button>
          </div>
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

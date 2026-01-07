"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { NoteListWithFilter } from "@/features/note/ui/NoteListWithFilter";

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const folderId = searchParams.get("folderId");

  return (
    <div className="flex-1 overflow-auto p-6">
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-16 text-base-muted">
            Loading notes...
          </div>
        }
      >
        <NoteListWithFilter folderId={folderId} />
      </Suspense>
    </div>
  );
}

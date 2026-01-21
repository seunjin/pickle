"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { NoteListWithFilter } from "@/features/note/ui/NoteListWithFilter";
import { PageSpinner } from "@/features/note/ui/PageSpinner";
export function DashboardContent() {
  const searchParams = useSearchParams();
  const folderId = searchParams.get("folderId");
  const tagId = searchParams.get("tagId");
  return (
    <div className="h-full">
      <Suspense fallback={<PageSpinner pageType="client" />}>
        <NoteListWithFilter
          folderId={folderId}
          tagId={tagId}
          nodataType="default"
        />
      </Suspense>
    </div>
  );
}

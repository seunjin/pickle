"use client";

import { toast, UtilButton } from "@pickle/ui";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { NoteListWithFilter } from "@/features/note/ui/NoteListWithFilter";

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const folderId = searchParams.get("folderId");
  const tagId = searchParams.get("tagId");

  return (
    <div className="h-full">
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-16 text-base-muted">
            Loading notes...
          </div>
        }
      >
        <NoteListWithFilter
          folderId={folderId}
          tagId={tagId}
          nodataType="default"
        />
      </Suspense>
    </div>
  );
}

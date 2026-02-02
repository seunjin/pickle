import { createFileRoute } from "@tanstack/react-router";
import { AuthGuard } from "@/features/auth/ui/AuthGuard";
import { NoteListWithFilter } from "@/features/note/ui/NoteListWithFilter";

export const Route = createFileRoute("/bookmarks")({
  component: BookmarksPage,
});

function BookmarksPage() {
  return (
    <AuthGuard>
      <div className="h-full">
        <NoteListWithFilter onlyBookmarked nodataType="bookmarks" />
      </div>
    </AuthGuard>
  );
}

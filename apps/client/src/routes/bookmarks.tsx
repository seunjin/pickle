import { createFileRoute } from "@tanstack/react-router";
import { NoteListWithFilter } from "@/features/note/ui/NoteListWithFilter";

export const Route = createFileRoute("/bookmarks")({
  component: BookmarksPage,
});

function BookmarksPage() {
  return (
    <div className="h-full">
      <NoteListWithFilter onlyBookmarked nodataType="bookmarks" />
    </div>
  );
}

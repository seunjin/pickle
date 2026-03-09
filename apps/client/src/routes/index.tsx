import { createFileRoute } from "@tanstack/react-router";
import { NoteListWithFilter } from "@/features/note/ui/NoteListWithFilter";

export const Route = createFileRoute("/")({
  component: DashboardPage,
});

function DashboardPage() {
  const { folderId, tagId } = Route.useSearch() as any;

  return <NoteListWithFilter folderId={folderId} tagId={tagId} />;
}

import { createFileRoute } from "@tanstack/react-router";
import { AuthGuard } from "@/features/auth/ui/AuthGuard";
import { NoteListWithFilter } from "@/features/note/ui/NoteListWithFilter";

export const Route = createFileRoute("/")({
  component: DashboardPage,
});

function DashboardPage() {
  const { folderId, tagId } = Route.useSearch() as any;

  return (
    <AuthGuard>
      <NoteListWithFilter folderId={folderId} tagId={tagId} />
    </AuthGuard>
  );
}

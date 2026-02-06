import { createFileRoute } from "@tanstack/react-router";
import { AuthGuard } from "@/features/auth/ui/AuthGuard";
import { NoteListWithFilter } from "@/features/note/ui/NoteListWithFilter";

export const Route = createFileRoute("/")({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <AuthGuard>
      <NoteListWithFilter />
    </AuthGuard>
  );
}

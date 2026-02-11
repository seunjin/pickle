import { createFileRoute } from "@tanstack/react-router";
import { TrashContent } from "@/features/note/ui/TrashContent";

export const Route = createFileRoute("/trash")({
  component: RouteComponent,
});

function RouteComponent() {
  return <TrashContent />;
}

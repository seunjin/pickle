import { createFileRoute } from "@tanstack/react-router";
import { SearchContent } from "@/features/note/ui/SearchContent";

export const Route = createFileRoute("/search")({
  component: SearchContent,
});

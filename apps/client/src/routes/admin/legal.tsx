import { createFileRoute } from "@tanstack/react-router";
import { LegalAdminContent } from "@/features/admin/ui/LegalAdminContent";

export const Route = createFileRoute("/admin/legal")({
  component: LegalAdminPage,
});

function LegalAdminPage() {
  return <LegalAdminContent />;
}

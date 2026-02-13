import { createFileRoute } from "@tanstack/react-router";
import { LegalContent } from "@/features/legal/ui/LegalContent";

export const Route = createFileRoute("/legal")({
  component: LegalPage,
});

function LegalPage() {
  return (
    <div className="h-full w-full overflow-hidden">
      <LegalContent />
    </div>
  );
}

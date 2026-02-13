import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { LegalContent } from "@/features/legal/ui/LegalContent";

const legalSearchSchema = z.object({
  tab: z.enum(["service", "privacy", "marketing"]).optional(),
});

export const Route = createFileRoute("/legal")({
  validateSearch: (search) => legalSearchSchema.parse(search),
  component: LegalPage,
});

function LegalPage() {
  return (
    <div className="h-full w-full overflow-hidden bg-base-background">
      <LegalContent />
    </div>
  );
}

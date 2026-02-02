import { createFileRoute } from "@tanstack/react-router";
import { AuthGuard } from "@/features/auth/ui/AuthGuard";
import { SettingContent } from "@/features/layout/ui/SettingContent";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <AuthGuard>
      <SettingContent />
    </AuthGuard>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { AuthGuard } from "@/features/auth/ui/AuthGuard";

export const Route = createFileRoute("/")({
  component: () => (
    <AuthGuard>
      <div className="flex min-h-screen items-center justify-center bg-base-background text-base-foreground">
        <div className="text-center">
          <h1 className="mb-4 font-bold text-4xl">Pickle Admin Dashboard</h1>
          <p className="text-neutral-500">운영 관리 메인 화면입니다.</p>
        </div>
      </div>
    </AuthGuard>
  ),
});

import { AuthGuard } from "@/features/auth/ui/AuthGuard";
import { Sidebar } from "@/features/layout/Sidebar";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-base-background text-base-foreground">
        {/* Sidebar */}
        <aside className="w-85 shrink-0 border-base-border border-r bg-base-background">
          <Sidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </AuthGuard>
  );
}

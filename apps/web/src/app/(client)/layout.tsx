import { AuthGuard } from "@/features/auth/ui/AuthGuard";
import { Sidebar } from "@/features/layout/sidebar/Sidebar";
import { AppHeader } from "@/features/layout/ui/AppHeader";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-base-background text-base-foreground">
        <aside className="h-full w-75 shrink-0 border-base-border border-r">
          <Sidebar />
        </aside>
        <div className="flex flex-1 flex-col overflow-hidden">
          <AppHeader />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}

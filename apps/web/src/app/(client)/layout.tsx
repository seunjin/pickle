import { AuthGuard } from "@/features/auth/ui/AuthGuard";
import { Sidebar } from "@/features/layout/Sidebar";

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
        <main className="h-full flex-1 overflow-auto">{children}</main>
      </div>
    </AuthGuard>
  );
}

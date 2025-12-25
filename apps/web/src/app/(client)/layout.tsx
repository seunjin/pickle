import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@pickle/ui";
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
        <ResizablePanelGroup orientation="horizontal" className="min-h-screen">
          <ResizablePanel
            defaultSize={300}
            minSize={240}
            maxSize={360}
            className="h-full border-base-border border-r"
          >
            <Sidebar />
          </ResizablePanel>
          <ResizableHandle withHandle={false} />
          <ResizablePanel defaultSize={80}>
            <main className="h-full overflow-auto">{children}</main>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </AuthGuard>
  );
}

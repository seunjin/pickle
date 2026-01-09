import { ScrollArea } from "@pickle/ui";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { AuthGuard } from "@/features/auth/ui/AuthGuard";
import { SidebarWrapper } from "@/features/layout/sidebar/SidebarWrapper";
import { AppHeader } from "@/features/layout/ui/AppHeader";
import { getQueryClient } from "@/shared/lib/react-query/getQueryClient";
import { createClient } from "@/shared/lib/supabase/server";

export default async function AppClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const queryClient = getQueryClient();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AuthGuard>
        <div className="flex h-dvh bg-base-background text-base-foreground">
          <aside className="h-full w-75 shrink-0 border-base-border border-r">
            <SidebarWrapper />
          </aside>
          <div className="grid flex-1 grid-rows-[auto_1fr]">
            <AppHeader />
            <main className="overflow-auto">
              <ScrollArea className="h-full">
                <div className="p-10">{children}</div>
              </ScrollArea>
            </main>
          </div>
        </div>
      </AuthGuard>
    </HydrationBoundary>
  );
}

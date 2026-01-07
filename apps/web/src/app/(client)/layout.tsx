import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { AuthGuard } from "@/features/auth/ui/AuthGuard";
import { folderQueries } from "@/features/folder";
import { SidebarWrapper } from "@/features/layout/sidebar/SidebarWrapper";
import { AppHeader } from "@/features/layout/ui/AppHeader";
import { getQueryClient } from "@/shared/lib/react-query/getQueryClient";
import { createClient } from "@/shared/lib/supabase/server";

export const dynamic = "force-dynamic";

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

  await queryClient.prefetchQuery(folderQueries.list(supabase));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AuthGuard>
        <div className="flex h-screen overflow-hidden bg-base-background text-base-foreground">
          <aside className="h-full w-75 shrink-0 border-base-border border-r">
            <SidebarWrapper />
          </aside>
          <div className="flex flex-1 flex-col overflow-hidden">
            <AppHeader />
            <main className="flex-1 overflow-auto">{children}</main>
          </div>
        </div>
      </AuthGuard>
    </HydrationBoundary>
  );
}

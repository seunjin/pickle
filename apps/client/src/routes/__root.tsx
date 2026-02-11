import { ScrollArea } from "@pickle/ui";
import { createRootRoute, Outlet, useLocation } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { SidebarWrapper } from "@/features/layout/sidebar/SidebarWrapper";
import { AppHeader } from "@/features/layout/ui/AppHeader";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const { pathname } = useLocation();

  // 로그인/회원가입/동기화/관리자 페이지는 메인 레이아웃 제외
  const isAuthPage =
    pathname === "/signin" ||
    pathname === "/signup" ||
    pathname.startsWith("/auth/");

  // Admin은 자체 레이아웃(사이드바)을 가지므로 메인 레이아웃 제외
  const isAdminPage = pathname.startsWith("/admin");

  if (isAuthPage || isAdminPage) {
    return (
      <>
        <Outlet />
        {import.meta.env.DEV && (
          <TanStackRouterDevtools initialIsOpen={false} />
        )}
      </>
    );
  }

  return (
    <div className="flex h-dvh bg-base-background text-base-foreground">
      <aside className="h-full w-75 shrink-0 border-base-border border-r">
        <SidebarWrapper />
      </aside>
      <div className="grid flex-1 grid-rows-[auto_1fr]">
        <AppHeader />
        <main className="overflow-auto">
          <ScrollArea className="h-full">
            <div className="h-[calc(100dvh-var(--web-header-height))] p-10">
              <Outlet />
            </div>
          </ScrollArea>
        </main>
      </div>
      {import.meta.env.DEV && <TanStackRouterDevtools initialIsOpen={false} />}
    </div>
  );
}

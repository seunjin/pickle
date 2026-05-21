import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { useSessionContext } from "@/features/auth/model/SessionContext";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

/**
 * Admin 라우트 레이아웃
 *
 * 클라이언트 사이드에서 authority 검증 후
 * super_admin/admin이 아니면 대시보드로 리다이렉트.
 * (SSR 권한체크였던 web의 (admin)/layout.tsx를 CSR로 전환)
 */
function AdminLayout() {
  const { appUser, isLoading } = useSessionContext();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-base-primary border-t-transparent" />
      </div>
    );
  }

  // 권한 검증: super_admin 또는 admin만 접근 가능
  if (
    !appUser ||
    (appUser.authority !== "super_admin" && appUser.authority !== "admin")
  ) {
    throw redirect({ to: "/" });
  }

  return (
    <div className="flex h-full min-h-0 bg-slate-950 text-white">
      <aside className="flex w-64 shrink-0 flex-col border-slate-800 border-r bg-slate-900 p-6">
        <div className="mb-8 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-indigo-600 font-bold">
            P
          </div>
          <h1 className="font-bold text-xl tracking-tight">Admin</h1>
        </div>
        <nav className="flex flex-col gap-2 text-slate-400 text-sm">
          <Link
            to="/admin"
            className="rounded-md px-3 py-2 hover:bg-slate-800 hover:text-white [&.active]:bg-slate-800 [&.active]:text-white"
          >
            대시보드
          </Link>
          <Link
            to="/admin/legal"
            className="rounded-md px-3 py-2 hover:bg-slate-800 hover:text-white [&.active]:bg-slate-800 [&.active]:text-white"
          >
            약관 관리
          </Link>
          <Link
            to="/admin/waitlist"
            className="rounded-md px-3 py-2 hover:bg-slate-800 hover:text-white [&.active]:bg-slate-800 [&.active]:text-white"
          >
            신청 내역
          </Link>
        </nav>
      </aside>
      <main className="flex-1 overflow-auto bg-slate-950 p-10">
        <Outlet />
      </main>
    </div>
  );
}

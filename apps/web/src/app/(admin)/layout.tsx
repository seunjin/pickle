import { redirect } from "next/navigation";
import { getUser } from "@/features/auth/api/getUser";
import { createClient } from "@/shared/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // 1. 세션 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 비로그인 유저 -> 랜딩 페이지로
  if (!user) {
    redirect("/");
  }

  // 2. 관리자 권한 확인
  const appUser = await getUser(supabase, user.id);

  // 권한이 없거나 일반 멤버인 경우 -> 대시보드로
  if (
    !appUser ||
    (appUser.authority !== "super_admin" && appUser.authority !== "admin")
  ) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <aside className="w-64 border-slate-800 border-r bg-slate-900 p-6">
        <div className="mb-8 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-indigo-600 font-bold">
            P
          </div>
          <h1 className="font-bold text-xl tracking-tight">Admin</h1>
        </div>
        <nav className="flex flex-col gap-2 text-slate-400 text-sm">
          <div className="rounded-md bg-slate-800 px-3 py-2 text-white">
            대시보드
          </div>
          <div className="px-3 py-2 hover:text-white">사용자 관리</div>
          <div className="px-3 py-2 hover:text-white">약관 관리</div>
          <div className="px-3 py-2 hover:text-white">시스템 설정</div>
        </nav>
      </aside>
      <main className="flex-1 overflow-auto bg-slate-950 p-10">{children}</main>
    </div>
  );
}

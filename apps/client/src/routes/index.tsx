import { createFileRoute } from '@tanstack/react-router'
import { AuthGuard } from '@/features/auth/ui/AuthGuard'
import { useUser } from "@/features/auth/model/useUser";
import { createClient } from "@/shared/lib/supabase";

export const Route = createFileRoute('/')({
  component: DashboardPage,
})

function DashboardPage() {
  const { user } = useUser();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col items-center justify-center bg-base-background text-base-foreground">
        <div className="text-center">
          <h1 className="mb-4 font-bold text-4xl">Pickle Dashboard</h1>
          <p className="mb-8 text-neutral-500">
            로그인된 사용자: <span className="font-semibold text-base-primary">{user?.email}</span>
          </p>

          <button
            onClick={handleSignOut}
            className="rounded-lg bg-red-500 px-6 py-2 font-medium text-white transition-colors hover:bg-red-600"
          >
            로그아웃
          </button>
        </div>
      </div>
    </AuthGuard>
  );
}

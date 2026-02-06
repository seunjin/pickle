import { AuthGuard } from "@/features/auth/ui/AuthGuard";

function App() {
  return (
    <AuthGuard>
      <div className="flex min-h-screen items-center justify-center bg-base-background text-base-foreground">
        <div className="text-center">
          <h1 className="mb-4 font-bold text-4xl">Pickle Client</h1>
          <p className="text-neutral-500">
            인증이 완료된 사용자 전역 SPA 화면입니다.
          </p>
        </div>
      </div>
    </AuthGuard>
  );
}

export default App;

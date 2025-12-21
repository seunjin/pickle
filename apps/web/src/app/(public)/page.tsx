import type { Metadata } from "next";
import { getServerAuth } from "@/features/auth/api/getServerAuth";
import { LandingButtons } from "../../features/auth/ui/LandingButtons";

export const metadata: Metadata = {
  title: "Pickle Note",
  description: "Web의 모든 것을 캡처하고 정리하세요.",
};

export default async function Home(props: {
  searchParams: Promise<{ next?: string }>;
}) {
  const searchParams = await props.searchParams;
  const next = searchParams?.next;

  const { user, appUser } = await getServerAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col items-center justify-center gap-8 p-8 text-center">
        <div className="max-w-2xl space-y-4">
          <h1 className="font-bold text-5xl tracking-tight">Pickle Note</h1>
          <p className="text-gray-600 text-xl dark:text-gray-400">
            웹 서핑 중 발견한 모든 영감을 <br className="sm:hidden" />한 곳에
            저장하고 관리하세요.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <LandingButtons
            next={next}
            initialUser={user}
            initialAppUser={appUser}
          />
        </div>
      </main>

      <footer className="py-8 text-center text-gray-500 text-sm">
        © 2025 Pickle Note. All rights reserved.
      </footer>
    </div>
  );
}

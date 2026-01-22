import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getServerAuth } from "@/features/auth/api/getServerAuth";
import { PageSpinner } from "@/features/note/ui/PageSpinner";
import SignupPageContent from "./SignupPageContent";

export default async function SignupPage() {
  const { user, appUser } = await getServerAuth();

  // 이미 로그인되어 활성화된 유저라면 대시보드로 이동
  if (user && appUser?.status === "active") {
    redirect("/dashboard");
  }

  return (
    <Suspense fallback={<PageSpinner />}>
      <SignupPageContent />
    </Suspense>
  );
}

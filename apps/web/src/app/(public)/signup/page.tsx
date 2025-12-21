import { Suspense } from "react";
import SignupPageContent from "./SignupPageContent";

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      }
    >
      <SignupPageContent />
    </Suspense>
  );
}

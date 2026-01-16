import { Suspense } from "react";
import { PageSpinner } from "@/features/note/ui/PageSpinner";
import SignupPageContent from "./SignupPageContent";

export default function SignupPage() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <SignupPageContent />
    </Suspense>
  );
}

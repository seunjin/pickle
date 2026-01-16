import { ScrollArea, Spinner } from "@pickle/ui";
import { Suspense } from "react";
import AuthSyncPageContent from "./AuthSyncContentPage";

export default function AuthSyncPage() {
  return (
    <ScrollArea className="effect-bg h-dvh">
      <div className="h-dvh">
        <Suspense fallback={<Spinner />}>
          <AuthSyncPageContent />
        </Suspense>
      </div>
    </ScrollArea>
  );
}

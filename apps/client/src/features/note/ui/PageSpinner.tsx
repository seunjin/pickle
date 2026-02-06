import { Spinner } from "@pickle/ui";

interface PageSpinnerProps {
  pageType?: "client" | "admin" | "public";
}
export function PageSpinner({ pageType = "public" }: PageSpinnerProps) {
  if (pageType === "client") {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="size-8 text-base-primary" />
      </div>
    );
  }
  return (
    <div className="effect-bg flex min-h-screen items-center justify-center">
      <Spinner className="size-8 text-base-primary" />
    </div>
  );
}

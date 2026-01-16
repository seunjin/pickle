import { Spinner } from "@pickle/ui";

export function PageSpinner() {
  return (
    <div className="effect-bg flex min-h-screen items-center justify-center">
      <Spinner className="size-8 text-base-primary" />
    </div>
  );
}

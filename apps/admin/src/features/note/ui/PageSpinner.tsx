import { Spinner } from "@pickle/ui";

export function PageSpinner() {
  return (
    <div className="flex h-dvh w-full items-center justify-center bg-base-background">
      <Spinner className="size-8 text-base-primary" />
    </div>
  );
}

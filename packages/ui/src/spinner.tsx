import { cn } from "./lib/utils";

function Spinner({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn("size-4", className)}
      {...props}
    >
      <div className="spinner-loader" />
    </div>
  );
}

export { Spinner };

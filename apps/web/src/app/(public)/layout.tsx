import { ScrollArea } from "@pickle/ui";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-dvh">
      <ScrollArea className="h-full max-h-dvh overflow-auto">
        {children}
      </ScrollArea>
    </div>
  );
}

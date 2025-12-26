export function NoteCardContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="group -outline-offset-1 cursor-pointer overflow-hidden rounded-[20px] border border-base-border bg-neutral-900 text-tag hover:outline-2 hover:outline-base-primary">
      {children}
    </div>
  );
}

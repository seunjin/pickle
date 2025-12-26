interface TextNoteContentProps {
  text: string;
}

export function TextNoteContent({ text }: TextNoteContentProps) {
  return (
    <div className="relative">
      <p className="line-clamp-4 font-medium text-neutral-200 text-sm leading-relaxed">
        {text}
      </p>
      {/* <div className="-bottom-1 -right-1 absolute h-8 w-8 bg-gradient-to-br from-transparent to-neutral-900" /> */}
    </div>
  );
}

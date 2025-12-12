interface HeaderProps {
  title: string;
  onBack: () => void;
  onClose: () => void;
}

export function Header({ title, onBack, onClose }: HeaderProps) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-full p-2 transition-colors hover:bg-gray-100"
        >
          ◀
        </button>
        <h2 className="font-bold text-lg">{title}</h2>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="p-2 text-gray-400 hover:text-gray-600"
      >
        ✕
      </button>
    </div>
  );
}

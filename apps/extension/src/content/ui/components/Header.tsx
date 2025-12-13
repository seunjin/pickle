interface HeaderProps {
  title: string;
  onClose: () => void;
}

export function Header({ title, onClose }: HeaderProps) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <div className="flex items-center gap-3">
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

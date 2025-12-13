interface MenuButtonProps {
  label: string;
  icon: string;
  color: string;
  onClick: () => void;
}

export function MenuButton({ label, icon, color, onClick }: MenuButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2 rounded-2xl p-6 shadow-sm transition-all active:scale-95 ${color}`}
    >
      <span className="text-3xl">{icon}</span>
      <span className="font-semibold text-sm">{label}</span>
    </button>
  );
}

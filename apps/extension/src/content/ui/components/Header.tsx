interface HeaderProps {
  title: string;
  onClose: () => void;
}

export function Header({ title, onClose }: HeaderProps) {
  const handleLogout = () => {
    if (confirm("로그아웃 하시겠습니까?")) {
      chrome.storage.local.remove("supabaseSession");
    }
  };

  return (
    <div className="mb-2 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h2 className="font-bold text-lg">{title}</h2>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded px-2 py-0.5 font-medium text-gray-400 text-xs hover:bg-gray-100 hover:text-red-500"
        >
          Logout
        </button>
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

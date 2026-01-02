import { ActionButton } from "@pickle/ui";
import pickleLogo from "@/assets/pickle-logo.svg";

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
    <div className="flex items-center justify-between px-5 pt-5">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <img src={pickleLogo} alt="피클 로고" />
          <h2 className="font-semibold text-[18px] text-base-foreground">
            {title}
          </h2>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="rounded px-2 py-0.5 font-medium text-gray-400 text-xs hover:bg-gray-100 hover:text-red-500"
        >
          로그아웃
        </button>
      </div>
      <ActionButton icon="delete_16" onClick={onClose} />
    </div>
  );
}

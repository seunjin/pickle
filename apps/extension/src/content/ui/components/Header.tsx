import { ActionButton } from "@pickle/ui";
import pickleLogo from "@/assets/pickle-logo.svg";

interface HeaderProps {
  title: string;
  onClose: () => void;
}

export function Header({ title, onClose }: HeaderProps) {
  return (
    <div className="flex items-center justify-between px-5 pt-5">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <img src={pickleLogo} alt="피클 로고" className="size-6" />
          <h2 className="font-semibold text-[16px] text-base-foreground">
            {title}
          </h2>
        </div>
      </div>
      <ActionButton icon="delete_16" onClick={onClose} />
    </div>
  );
}

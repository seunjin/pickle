import type { NoteWithAsset } from "@pickle/contracts/src/note";
import { Icon } from "@pickle/ui";

interface NoteCardHeaderProps {
  type: NoteWithAsset["type"];
  createdAt: string;
  onDelete: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  text: "TEXT",
  image: "IMAGE",
  capture: "CAPTURE",
  bookmark: "URL",
};

export function NoteCardHeader({
  type,
  createdAt,
  onDelete,
}: NoteCardHeaderProps) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-neutral-800 px-2.5 py-0.5 font-semibold text-[10px] text-neutral-400 tracking-wider">
          {TYPE_LABELS[type] || type.toUpperCase()}
        </span>
        <span className="text-[11px] text-neutral-500">
          {new Date(createdAt).toLocaleDateString("ko-KR")}
        </span>
      </div>

      <button
        type="button"
        className="text-neutral-500 opacity-0 transition-opacity hover:text-white group-hover:opacity-100"
        onClick={(e) => {
          e.preventDefault(); // 부모 링크 클릭 방지 등
          e.stopPropagation();
          onDelete();
        }}
      >
        <Icon name="trash" size={20} className="size-4" />
      </button>
    </div>
  );
}

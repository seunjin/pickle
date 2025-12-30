import type { NoteWithAsset } from "@pickle/contracts/src/note";
import { Icon } from "@pickle/icons";

interface NoteCardFooterProps {
  url: string;
  meta: NoteWithAsset["meta"];
  onDelete: () => void;
}

export function NoteCardFooter({ url, meta, onDelete }: NoteCardFooterProps) {
  return (
    <div className="mt-4 flex items-center justify-between border-neutral-800 border-t pt-3">
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="group/source flex items-center gap-2 overflow-hidden"
        onClick={(e) => e.stopPropagation()} // 카드 클릭과 간섭 방지
      >
        {/* 파비콘 */}
        <div className="relative h-4 w-4 shrink-0 overflow-hidden rounded bg-white/10 p-px">
          {meta?.favicon ? (
            <img
              src={meta.favicon}
              alt=""
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-neutral-800 text-[8px] text-neutral-500">
              Link
            </div>
          )}
        </div>

        {/* 사이트 이름 및 호스트네임 */}
        <div className="flex flex-col truncate">
          <span className="truncate font-medium text-[11px] text-neutral-300 transition-colors group-hover/source:text-base-primary">
            {meta?.site_name || new URL(url).hostname}
          </span>
        </div>
      </a>
      <button
        type="button"
        className="text-neutral-500 opacity-0 transition-opacity hover:text-white group-hover:opacity-100"
        onClick={(e) => {
          e.preventDefault(); // 부모 링크 클릭 방지 등
          e.stopPropagation();
          onDelete();
        }}
      >
        <Icon name="trash" size={"20"} className="size-4" />
      </button>
    </div>
  );
}

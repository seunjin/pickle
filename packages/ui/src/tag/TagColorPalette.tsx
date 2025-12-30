"use client";
import { Icon } from "@pickle/icons";
import { TAG_COLORS, TAG_VARIANTS, type TagColor } from "../constants/tag";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import { cn } from "../lib/utils";

const Label = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-7 items-center px-1 font-medium text-[12px] text-neutral-500">
      {children}
    </div>
  );
};
interface TagColorPaletteProps {
  trigger: React.ReactNode;
  color: TagColor;
  onColorChange: (color: TagColor) => void;
  /** 드롭다운 열림/닫힘 상태 콜백 (부모에서 active 스타일 적용 시 사용) */
  onOpenChange?: (open: boolean) => void;
}
export function TagColorPalette({
  trigger,
  color,
  onColorChange,
  onOpenChange,
}: TagColorPaletteProps) {
  return (
    <DropdownMenu onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="end" className="z-[1100000]">
        <Label>색</Label>
        <div className="flex w-[145px] flex-wrap gap-1 pb-1.5">
          {TAG_COLORS.map((tag) => {
            const style = TAG_VARIANTS[tag as keyof typeof TAG_VARIANTS];

            return (
              <button
                key={tag}
                type="button"
                className={cn(
                  //공통
                  "size-5 rounded-[4px] border",
                  style.paletteColor,
                )}
                onClick={() => onColorChange(tag)}
              >
                <Icon
                  name="check"
                  size={"16"}
                  className={cn(
                    "text-base-foreground transition-opacity",
                    color === tag ? "opacity-100" : "opacity-0",
                  )}
                />
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className="flex h-[26px] w-full items-center gap-2 rounded-[4px] px-2 text-[13px] text-base-muted-foreground transition-[background-color,color] hover:bg-neutral-650/50 hover:text-neutral-300"
        >
          <Icon name="setting" size="16" className="text-inherit" />
          태그 설정
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

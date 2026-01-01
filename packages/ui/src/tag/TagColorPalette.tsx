"use client";
import { Icon } from "@pickle/icons";
import { TAG_COLORS, TAG_VARIANTS, type TagColor } from "../constants/tag";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import { cn } from "../lib/utils";

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
      <DropdownMenuContent
        side="bottom"
        align="end"
        className="z-[110000] shadow-black/50 shadow-lg"
      >
        <DropdownMenuLabel>색</DropdownMenuLabel>

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
                  name="check_16"
                  className={cn(
                    "text-base-foreground transition-opacity",
                    color === tag ? "opacity-100" : "opacity-0",
                  )}
                />
              </button>
            );
          })}
        </div>

        <DropdownMenuItem asChild>
          <button type="button" className="w-full cursor-pointer">
            <Icon name="setting_16" className="text-inherit" />
            태그 설정
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

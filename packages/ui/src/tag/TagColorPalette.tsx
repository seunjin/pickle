"use client";
import { Icon } from "@pickle/icons";
import { useState } from "react";
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
  color: TagColor;
  onColorChange: (color: TagColor) => void;
  onOpenChange?: (open: boolean) => void;
}

/**
 * 오직 태그의 색상만 변경하기 위한 순수 색상 팔레트 컴포넌트
 * 부모에서 색상 상태를 제어하는 Controlled Component 입니다.
 */
export function TagColorPalette({
  color,
  onColorChange,
  onOpenChange,
}: TagColorPaletteProps) {
  const [open, setOpen] = useState<boolean>(false);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <DropdownMenuItem asChild forceFocus={open}>
          <button
            type="button"
            className="w-full cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Icon name="tag_16" /> 색상 변경
          </button>
        </DropdownMenuItem>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="right"
        align="start"
        className="z-[110000] w-[155px] shadow-standard"
      >
        <div
          onPointerMove={(e) => e.stopPropagation()}
          className="flex flex-col gap-1"
        >
          <DropdownMenuLabel className="px-2 py-1.5 font-normal text-neutral-500">
            색상
          </DropdownMenuLabel>
          <div className="flex flex-wrap gap-1 p-2 pt-0">
            {TAG_COLORS.map((tag) => {
              const style = TAG_VARIANTS[tag as keyof typeof TAG_VARIANTS];

              return (
                <button
                  key={tag}
                  type="button"
                  tabIndex={-1}
                  className={cn(
                    "size-5 rounded-[4px] border transition-colors",
                    style.paletteColor,
                  )}
                  onClick={() => onColorChange(tag)}
                  onPointerDown={(e) => e.preventDefault()}
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
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

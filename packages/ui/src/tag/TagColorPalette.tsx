"use client";
import { Icon } from "@pickle/icons";
import { useRef } from "react";
import { TAG_COLORS, TAG_VARIANTS, type TagColor } from "../constants/tag";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import { Input } from "../input";
import { cn } from "../lib/utils";

interface TagColorPaletteProps {
  trigger: React.ReactNode;
  name: string;
  color: TagColor;
  onNameChange: (name: string) => void;
  onColorChange: (color: TagColor) => void;
  onDeleteTag: () => void;
  onSave?: () => void;

  /** 드롭다운 열림/닫힘 상태 콜백 (부모에서 active 스타일 적용 시 사용) */
  onOpenChange?: (open: boolean) => void;
}
export function TagColorPalette({
  trigger,
  name,
  color,
  onNameChange,
  onColorChange,
  onDeleteTag,
  onSave,
  onOpenChange,
}: TagColorPaletteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <DropdownMenu onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        side="bottom"
        align="end"
        className="z-[110000] shadow-standard"
      >
        <div
          onPointerMove={(e) => e.stopPropagation()}
          className="flex flex-col gap-1"
          ref={(node) => {
            if (node) {
              // 메뉴가 열려 div가 마운트될 때 Input에 포커스
              setTimeout(() => inputRef.current?.focus(), 50);
            }
          }}
        >
          <div className="mb-1">
            <Input
              ref={inputRef}
              size={"mini"}
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.nativeEvent.isComposing) return;
                if (e.key === "Enter") {
                  onSave?.();
                }
              }}
              onPointerDown={(e) => e.stopPropagation()}
            />
          </div>

          <CustomMenuItem
            onClick={onDeleteTag}
            onPointerDown={(e) => e.preventDefault()}
          >
            <Icon name="trash_16" className="text-inherit" />
            삭제
          </CustomMenuItem>
          <DropdownMenuSeparator />

          <DropdownMenuLabel>색</DropdownMenuLabel>
          <div className="flex w-[145px] flex-wrap gap-1 pb-1.5">
            {TAG_COLORS.map((tag) => {
              const style = TAG_VARIANTS[tag as keyof typeof TAG_VARIANTS];

              return (
                <button
                  key={tag}
                  type="button"
                  tabIndex={-1}
                  className={cn(
                    //공통
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

          <CustomMenuItem
            onClick={onDeleteTag}
            onPointerDown={(e) => e.preventDefault()}
          >
            <Icon name="setting_16" className="text-inherit" />
            태그 설정
          </CustomMenuItem>
          <DropdownMenuItem asChild></DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// 커스텀용 MenuItem
const CustomMenuItem = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLButtonElement>) => (
  <button
    type="button"
    className={cn(
      /* --- [기본 레이아웃 및 스타일] --- */
      "relative flex h-[26px] select-none items-center gap-1 rounded-sm px-2 text-[13px] text-base-muted-foreground outline-hidden hover:text-base-foreground hover:[&_svg]:text-neutral-300",
      "cursor-pointer",

      /* --- [비활성화 상태] --- */
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",

      /* --- [인셋(여백) 처리] --- */
      "data-[inset]:pl-8",

      /* --- [아이콘(SVG) 공통 스타일] --- */
      "[&_svg:not([class*='size-'])]:size-3.5 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:text-base-muted-foreground",

      /* --- [Destructive 변형 - 빨간색 메뉴] --- */
      "data-[variant=destructive]:hover:text-red-500",
      "data-[variant=destructive]:focus:text-red-500",
      "data-[variant=destructive]:hover:[&_svg]:text-red-500", // 아이콘도 항상 텍스트 색상(빨강)을 따르도록
      "hover:bg-neutral-700",
      className,
    )}
    {...props}
  />
);

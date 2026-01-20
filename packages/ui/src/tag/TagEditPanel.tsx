"use client";
import { Icon } from "@pickle/icons";
import { useRef, useState } from "react";
import { TAG_COLORS, TAG_VARIANTS, type TagColor } from "../constants/tag";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import { Input } from "../input";
import { cn } from "../lib/utils";
import { MAX_TAG_NAME_LENGTH } from "./tag.constants";

interface TagEditPanelProps {
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

/**
 * 태그의 이름, 삭제, 색상을 모두 관리하는 통합 편집 패널
 */
export function TagEditPanel({
  trigger,
  name,
  color,
  onNameChange,
  onColorChange,
  onDeleteTag,
  onSave,
  onOpenChange,
}: TagEditPanelProps) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        side="bottom"
        align="end"
        className="z-[110000] w-[155px] shadow-standard"
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
              maxLength={MAX_TAG_NAME_LENGTH}
              onChange={(e) => onNameChange(e.target.value)}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.nativeEvent.isComposing) return;
                if (e.key === "Enter") {
                  onSave?.();
                  handleOpenChange(false);
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
          <div className="flex flex-wrap gap-1 pb-1.5">
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

// 커스텀용 MenuItem
const CustomMenuItem = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLButtonElement>) => (
  <button
    type="button"
    className={cn(
      "relative flex h-[26px] select-none items-center gap-1 rounded-sm px-2 text-[13px] text-base-muted-foreground outline-hidden hover:text-base-foreground hover:[&_svg]:text-neutral-300",
      "cursor-pointer",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      "data-[inset]:pl-8",
      "[&_svg:not([class*='size-'])]:size-3.5 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:text-base-muted-foreground",
      "data-[variant=destructive]:hover:text-red-500",
      "data-[variant=destructive]:focus:text-red-500",
      "data-[variant=destructive]:hover:[&_svg]:text-red-500",
      "hover:bg-neutral-700",
      className,
    )}
    {...props}
  />
);

"use client";

import { useState } from "react";
import { ActionButton } from "../button";
import { TAG_VARIANTS, type TagColor } from "../constants/tag";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import { Input } from "../input";
import { cn } from "../lib/utils";
import { ScrollArea } from "../scroll-area";
import { TagColorPalette } from "./TagColorPalette";

interface TagMakerProps {
  open: boolean;
  onOpenChange?: ((open: boolean) => void) | undefined;
  trigger: React.ReactNode;
}

interface TagItem {
  id: number;
  style: TagColor;
  name: string;
}

// 초기 태그 데이터 (실제로는 props나 API에서 받아올 수 있음)
const INITIAL_TAGS: TagItem[] = [
  { id: 1, style: "purple", name: "design" },
  { id: 2, style: "rose", name: "dev" },
  { id: 3, style: "green", name: "ideation" },
  { id: 4, style: "orange", name: "planning" },
  { id: 5, style: "yellow", name: "inspiration" },
  { id: 6, style: "blue", name: "strategy" },
];

const TagMaker = ({ trigger, open, onOpenChange }: TagMakerProps) => {
  // 태그 목록을 상태로 관리
  const [tags, setTags] = useState<TagItem[]>(INITIAL_TAGS);

  // 현재 팔레트가 열려있는 태그 ID (active 상태용)
  const [activePaletteId, setActivePaletteId] = useState<number | null>(null);

  // 특정 태그의 색상 변경 핸들러
  const handleColorChange = (tagId: number, newColor: TagColor) => {
    setTags((prevTags) =>
      prevTags.map((tag) =>
        tag.id === tagId ? { ...tag, style: newColor } : tag,
      ),
    );
  };

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side="bottom"
        className={cn(
          "z-[10000] h-[170px] w-[260px] p-0",
          "border border-base-border-light bg-neutral-850 shadow-standard",
        )}
      >
        <div className="grid h-full grid-rows-[auto_1fr]">
          <div className="h-9 border-base-border-light border-b bg-neutral-800">
            <Input variant={"ghost"} size={"mini"} autoFocus />
          </div>
          <ScrollArea className="h-full overflow-auto">
            <div className="px-[5px_10px] py-[5px_12px]">
              <DropdownMenuLabel>태그 선택 및 추가</DropdownMenuLabel>

              <ul className="space-y-0.5">
                {tags.map((tag) => {
                  const style = TAG_VARIANTS[tag.style];
                  const isActive = activePaletteId === tag.id;
                  return (
                    <li
                      key={tag.id}
                      className={cn(
                        "group grid h-[30px] grid-cols-[auto_1fr] items-center justify-between gap-2 rounded-[4px] px-1 hover:bg-neutral-700",
                        // 팔레트가 열린 아이템은 호버 스타일 유지
                        isActive && "bg-neutral-700",
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-6 min-w-0 flex-1 items-center gap-0.5 rounded-[4px] border px-1.5 text-[13px]",
                          style.tagColor,
                        )}
                      >
                        <span className="truncate">#{tag.name}</span>
                      </div>
                      <TagColorPalette
                        trigger={
                          <ActionButton
                            icon="ellipsis_16"
                            variant="subAction"
                            forceFocus={isActive}
                            className="shrink-0"
                          />
                        }
                        color={tag.style}
                        onColorChange={(newColor) =>
                          handleColorChange(tag.id, newColor)
                        }
                        onOpenChange={(isOpen) =>
                          setActivePaletteId(isOpen ? tag.id : null)
                        }
                      />
                    </li>
                  );
                })}
              </ul>
            </div>
          </ScrollArea>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TagMaker;

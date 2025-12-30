"use client";

import { Icon } from "@pickle/icons";
import { useState } from "react";
import { TAG_VARIANTS, type TagColor } from "../constants/tag";
import { Input } from "../input";
import { cn } from "../lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
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

const Label = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-7 items-center px-1 font-medium text-[12px] text-neutral-500">
      {children}
    </div>
  );
};

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
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align="end"
        side="bottom"
        className={cn(
          "z-[10000] h-[170px] w-[260px] p-0",
          "border border-base-border-light bg-neutral-850",
        )}
      >
        <div className="grid h-full grid-rows-[auto_1fr]">
          <div className="h-9 border-base-border-light border-b bg-neutral-800">
            <Input variant={"ghost"} size={"mini"} />
          </div>
          <ScrollArea className="h-full overflow-auto">
            <div className="px-[5px_10px] py-[5px_12px]">
              <Label>태그 선택 및 추가</Label>

              <ul className="space-y-0.5">
                {tags.map((tag) => {
                  const style = TAG_VARIANTS[tag.style];
                  const isActive = activePaletteId === tag.id;
                  return (
                    <li
                      key={tag.id}
                      className={cn(
                        "group flex h-[30px] items-center justify-between gap-2 rounded-[4px] px-1 hover:bg-neutral-700",
                        // 팔레트가 열린 아이템은 호버 스타일 유지
                        isActive && "bg-neutral-700",
                      )}
                    >
                      <span
                        className={cn(
                          "inline-flex h-6 items-center gap-0.5 rounded-[4px] border px-1.5 text-[13px]",
                          style.tagColor,
                        )}
                      >
                        #{tag.name}
                      </span>
                      <TagColorPalette
                        trigger={
                          <button
                            type="button"
                            className={cn(
                              "inline-flex size-[26px] items-center justify-center rounded-[4px] opacity-0 transition-[background-color,opacity] hover:bg-neutral-650/50 group-hover:opacity-100",
                              isActive && "bg-neutral-650/50 opacity-100",
                            )}
                          >
                            <Icon
                              name="ellipsis"
                              size="16"
                              className="text-neutral-300"
                            />
                          </button>
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
      </PopoverContent>
    </Popover>
  );
};

export default TagMaker;

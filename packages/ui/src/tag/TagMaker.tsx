"use client";

import type { Tag, TagColor } from "@pickle/contracts";
import { useState } from "react";
import { ActionButton } from "../button";
import { TAG_COLORS, TAG_VARIANTS } from "../constants/tag";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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

  // 데이터 관련 Props
  tags: Tag[]; // 전체 태그 목록
  selectedTagIds: string[]; // 현재 선택된 태그 ID들

  // 콜백 핸들러
  onSelectTag: (tagId: string) => void;
  onUnselectTag: (tagId: string) => void;
  onCreateTag: (name: string, style: TagColor) => void;
  onUpdateTag: (tagId: string, updates: Partial<Tag>) => void;
  onDeleteTag: (tagId: string) => void;
}

const TagMaker = ({
  trigger,
  open,
  onOpenChange,
  tags,
  selectedTagIds,
  onSelectTag,
  onUnselectTag,
  onCreateTag,
  onUpdateTag,
  onDeleteTag,
}: TagMakerProps) => {
  const [search, setSearch] = useState("");

  // 현재 팔레트가 열려있는 태그 ID (active 상태용)
  const [activePaletteId, setActivePaletteId] = useState<string | null>(null);

  // 현재 편집 중인 태그의 임시 상태 (이름, 색상)
  const [editingTag, setEditingTag] = useState<{
    id: string;
    name: string;
    style: TagColor;
  } | null>(null);

  // 검색 필터링된 태그 목록
  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && search.trim()) {
      // 정확히 일치하는 태그가 없으면 새로 생성
      const exactMatch = tags.find(
        (t) => t.name.toLowerCase() === search.trim().toLowerCase(),
      );
      if (exactMatch) {
        if (!selectedTagIds.includes(exactMatch.id)) {
          onSelectTag(exactMatch.id);
        }
      } else {
        // 랜덤 색상으로 새 태그 생성
        const randomColor =
          TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];
        onCreateTag(search.trim(), randomColor);
      }
      setSearch("");
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side="bottom"
        className={cn(
          "z-[10000] h-[200px] w-[260px] p-0",
          "border border-base-border-light bg-neutral-850 shadow-standard",
        )}
      >
        <div className="grid h-full grid-rows-[auto_1fr]">
          <div className="h-9 border-base-border-light border-b bg-neutral-800">
            <Input
              variant={"ghost"}
              size={"mini"}
              placeholder="Search or create tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </div>
          <ScrollArea className="h-full overflow-auto">
            <div className="px-[5px_10px] py-[5px_12px]">
              <DropdownMenuLabel className="mb-1 font-normal text-neutral-500">
                태그 선택 및 추가
              </DropdownMenuLabel>

              <ul className="space-y-0.5">
                {filteredTags.map((tag) => {
                  const isEditing = editingTag?.id === tag.id;
                  // 색상은 낙관적 업데이트 (편집 중인 색상이 있으면 우선 표시)
                  const displayStyle = isEditing
                    ? TAG_VARIANTS[editingTag.style]
                    : TAG_VARIANTS[tag.style];
                  const isActive = activePaletteId === tag.id;

                  return (
                    <li
                      key={tag.id}
                      className={cn(
                        "group grid h-[30px] grid-cols-[auto_1fr] items-center gap-1 rounded-[4px] px-1 transition-colors hover:bg-neutral-700",
                        isActive && "bg-neutral-700",
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-6 min-w-0 flex-1 items-center gap-0.5 rounded-[4px] border px-1.5 text-[13px] transition-colors duration-200",
                          displayStyle.tagColor,
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
                            className={cn(
                              "ml-auto shrink-0 opacity-0 group-hover:opacity-100",
                              isActive && "opacity-100",
                            )}
                          />
                        }
                        name={isEditing ? editingTag.name : tag.name}
                        color={isEditing ? editingTag.style : tag.style}
                        onNameChange={(newName) =>
                          setEditingTag((prev) =>
                            prev ? { ...prev, name: newName } : null,
                          )
                        }
                        onColorChange={(newColor) =>
                          setEditingTag((prev) =>
                            prev ? { ...prev, style: newColor } : null,
                          )
                        }
                        onDeleteTag={() => onDeleteTag(tag.id)}
                        onOpenChange={(isOpen) => {
                          setActivePaletteId(isOpen ? tag.id : null);
                          if (isOpen) {
                            // 열릴 때 현재 상태 복사
                            setEditingTag({
                              id: tag.id,
                              name: tag.name,
                              style: tag.style,
                            });
                          } else {
                            // 닫힐 때 변경사항이 있다면 API 호출
                            if (editingTag) {
                              const hasChanged =
                                editingTag.name !== tag.name ||
                                editingTag.style !== tag.style;
                              if (hasChanged) {
                                onUpdateTag(editingTag.id, {
                                  name: editingTag.name,
                                  style: editingTag.style,
                                });
                              }
                              // setEditingTag(null); // 즉시 해제하지 않고 다른 태그를 열거나 창이 닫힐 때까지 유지하여 깜빡임 방지
                            }
                          }
                        }}
                      />
                    </li>
                  );
                })}
              </ul>
            </div>
          </ScrollArea>
          {search && !filteredTags.find((t) => t.name === search) && (
            <>
              <DropdownMenuSeparator />
              <div className="p-1">
                <div className="bg-neutral-700 h-[30px] rounded-[4px] px-[8px_4px] flex items-center min-w-0">
                  <button
                    type="button"
                    onClick={() => {
                      const randomColor =
                        TAG_COLORS[
                          Math.floor(Math.random() * TAG_COLORS.length)
                        ];
                      onCreateTag(search.trim(), randomColor);
                      setSearch("");
                    }}
                    className="min-w-0 text-left flex items-center gap-2"
                  >
                    <span className="text-[12px] shrink-0 text-neutral-300">
                      생성
                    </span>{" "}
                    <p
                      className={cn(
                        TAG_VARIANTS[
                          TAG_COLORS[
                            Math.floor(Math.random() * TAG_COLORS.length)
                          ]
                        ].tagColor,
                        "rounded-[4px] border px-1.5 text-[13px] transition-colors duration-200 h-6 leading-[22px] truncate",
                      )}
                    >
                      #{search}
                    </p>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TagMaker;

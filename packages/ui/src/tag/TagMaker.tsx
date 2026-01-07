"use client";

import type { Tag, TagColor } from "@pickle/contracts";
import { Icon } from "@pickle/icons";
import { useEffect, useMemo, useRef, useState } from "react";
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
  onSetTags: (tagIds: string[]) => void;
  onCreateTag: (name: string, style: TagColor) => Promise<string | undefined>;
  onUpdateTag: (tagId: string, updates: Partial<Tag>) => void;
  onDeleteTag: (tagId: string) => void;

  // 설정
  autoSave?: boolean;
}

const TagMaker = ({
  trigger,
  open,
  onOpenChange,
  tags,
  selectedTagIds,
  onSetTags,
  onCreateTag,
  onUpdateTag,
  onDeleteTag,
  autoSave = true,
}: TagMakerProps) => {
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // 현재 선택된 태그 ID들 (로컬 상태로 관리)
  const [localSelectedTagIds, setLocalSelectedTagIds] =
    useState<string[]>(selectedTagIds);

  // 현재 팔레트가 열려있는 태그 ID (active 상태용)
  const [activePaletteId, setActivePaletteId] = useState<string | null>(null);

  // 현재 편집 중인 태그의 임시 상태 (이름, 색상)
  const [editingTag, setEditingTag] = useState<{
    id: string;
    name: string;
    style: TagColor;
  } | null>(null);

  // 마지막으로 저장(API 호출)된 상태를 추적하여 중복 호출 방지
  const lastSavedTagRef = useRef<{ name: string; style: TagColor } | null>(
    null,
  );

  // Props가 변경될 때 로컬 상태 동기화 (패널이 열릴 때만 초기값 설정)
  useEffect(() => {
    if (open) {
      setLocalSelectedTagIds(selectedTagIds);
    }
  }, [open, selectedTagIds]); // selectedTagIds 의존성 추가

  // 검색 필터링된 태그 목록
  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(search.toLowerCase()),
  );

  // 생성될 태그의 랜덤 스타일 (검색어가 바뀔 때마다 일정하게 유지하되, 완전히 새로 시작할 때만 변경)
  // biome-ignore lint/correctness/useExhaustiveDependencies: 검색어가 비워질 때(생성 후 등)만 색상을 새로 고침
  const randomColor = useMemo(() => {
    return TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];
  }, [search === ""]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === "Enter" && search.trim()) {
      // 정확히 일치하는 태그가 없으면 새로 생성
      const exactMatch = tags.find(
        (t) => t.name.toLowerCase() === search.trim().toLowerCase(),
      );
      if (exactMatch) {
        if (!localSelectedTagIds.includes(exactMatch.id)) {
          setLocalSelectedTagIds((prev) => [...prev, exactMatch.id]);
        }
      } else {
        // 미리보기와 동일한 랜덤 색상으로 새 태그 생성 후 로컬 상태에 추가
        onCreateTag(search.trim(), randomColor).then((newId) => {
          if (newId) {
            setLocalSelectedTagIds((prev) => [...prev, newId]);
          }
        });
      }
      setSearch("");
    }
    // Backspace로 태그 삭제 기능
    if (
      e.key === "Backspace" &&
      search === "" &&
      localSelectedTagIds.length > 0
    ) {
      setLocalSelectedTagIds((prev) => prev.slice(0, -1));
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange?.(isOpen);
    if (!isOpen && autoSave) {
      // 닫힐 때 변경 사항 확인 후 업데이트 (autoSave가 true일 때만)
      const isChanged =
        localSelectedTagIds.length !== selectedTagIds.length ||
        localSelectedTagIds.some((id) => !selectedTagIds.includes(id));

      if (isChanged) {
        onSetTags(localSelectedTagIds);
      }
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side="bottom"
        className={cn(
          "z-[10000] h-auto max-h-[400px] w-[360px] p-0",
          "border border-base-border-light bg-neutral-850 shadow-standard",
        )}
      >
        <div className="flex flex-col overflow-hidden">
          <div className="flex min-h-[39px] flex-wrap items-center gap-1 border-base-border-light border-b bg-neutral-800 px-2 py-1.5 transition-all">
            {localSelectedTagIds.map((id) => {
              const tag = tags.find((t) => t.id === id);
              if (!tag) return null;
              const style = TAG_VARIANTS[tag.style];
              return (
                <div
                  key={tag.id}
                  className={cn(
                    "grid h-[26px] grid-cols-[1fr_auto] items-center gap-0.5 rounded-[4px] border px-1 transition-all",
                    style.tagColor,
                  )}
                >
                  <span className="truncate text-[12px]">#{tag.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setLocalSelectedTagIds((prev) =>
                        prev.filter((tid) => tid !== tag.id),
                      );
                      inputRef.current?.focus();
                    }}
                    className="ml-0.5 flex size-4 items-center justify-center rounded-full"
                  >
                    <Icon name="delete_16" className={cn(style.buttonColor)} />
                  </button>
                </div>
              );
            })}
            <Input
              ref={inputRef}
              variant={"ghost"}
              size={"mini"}
              placeholder={
                localSelectedTagIds.length === 0
                  ? "Search or create tag..."
                  : ""
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-5 min-w-[60px] flex-1 border-none bg-transparent p-0 text-[13px] focus-visible:ring-0"
              autoFocus
            />
          </div>
          <ScrollArea className="h-full max-h-[200px] min-h-[160px] overflow-auto *:data-radix-scroll-area-viewport:max-h-[200px]">
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
                  const isSelected = localSelectedTagIds.includes(tag.id);

                  const handleSave = () => {
                    if (editingTag) {
                      const isChangedFromOriginal =
                        editingTag.name !== tag.name ||
                        editingTag.style !== tag.style;

                      const isChangedFromLastSaved =
                        !lastSavedTagRef.current ||
                        editingTag.name !== lastSavedTagRef.current.name ||
                        editingTag.style !== lastSavedTagRef.current.style;

                      if (isChangedFromOriginal && isChangedFromLastSaved) {
                        onUpdateTag(editingTag.id, {
                          name: editingTag.name,
                          style: editingTag.style,
                        });
                        // 마지막 저장 상태 업데이트
                        lastSavedTagRef.current = {
                          name: editingTag.name,
                          style: editingTag.style,
                        };
                      }
                    }
                  };

                  return (
                    <li
                      key={tag.id}
                      className={cn(
                        "group flex h-[30px] items-center gap-2 rounded-[4px] px-1 transition-colors hover:bg-neutral-700",
                        (isActive || isSelected) && "bg-neutral-700",
                      )}
                    >
                      <div
                        className="grid flex-1 cursor-pointer grid-cols-[auto_1fr] items-center gap-2"
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          if (isSelected) {
                            setLocalSelectedTagIds((prev) =>
                              prev.filter((id) => id !== tag.id),
                            );
                          } else {
                            setLocalSelectedTagIds((prev) => [...prev, tag.id]);
                          }
                          inputRef.current?.focus();
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            if (isSelected) {
                              setLocalSelectedTagIds((prev) =>
                                prev.filter((id) => id !== tag.id),
                              );
                            } else {
                              setLocalSelectedTagIds((prev) => [
                                ...prev,
                                tag.id,
                              ]);
                            }
                            inputRef.current?.focus();
                          }
                        }}
                      >
                        <div
                          className={cn(
                            "flex h-6 min-w-0 cursor-pointer items-center gap-0.5 rounded-[4px] border px-1.5 text-[13px] transition-colors duration-200",
                            displayStyle.tagColor,
                          )}
                        >
                          <span className="truncate">#{tag.name}</span>
                        </div>
                        <div className="ml-auto size-4">
                          {isSelected && (
                            <Icon
                              name="check_16"
                              className="text-base-primary"
                            />
                          )}
                        </div>
                      </div>

                      <div className="ml-auto flex shrink-0 items-center gap-2">
                        <TagColorPalette
                          trigger={
                            <ActionButton
                              icon="ellipsis_16"
                              variant="subAction"
                              forceFocus={isActive}
                              className={cn(
                                "opacity-0 group-hover:opacity-100",
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
                          onSave={handleSave}
                          onOpenChange={(isOpen) => {
                            setActivePaletteId(isOpen ? tag.id : null);
                            if (isOpen) {
                              // 열릴 때 현재 상태 복사 및 저장 기록 초기화
                              lastSavedTagRef.current = null;
                              setEditingTag({
                                id: tag.id,
                                name: tag.name,
                                style: tag.style,
                              });
                            } else {
                              // 닫힐 때 변경사항이 있다면 저장 로직 수행
                              handleSave();
                            }
                          }}
                        />
                      </div>
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
                <div className="flex h-[30px] min-w-0 items-center rounded-[4px] bg-neutral-700 px-[8px_4px]">
                  <button
                    type="button"
                    onClick={async () => {
                      const newId = await onCreateTag(
                        search.trim(),
                        randomColor,
                      );
                      if (newId) {
                        setLocalSelectedTagIds((prev) => [...prev, newId]);
                      }
                      setSearch("");
                      inputRef.current?.focus();
                    }}
                    className="flex min-w-0 items-center gap-2 text-left"
                  >
                    <span className="shrink-0 text-[12px] text-neutral-300">
                      생성
                    </span>{" "}
                    <p
                      className={cn(
                        TAG_VARIANTS[randomColor].tagColor,
                        "h-6 truncate rounded-[4px] border px-1.5 text-[13px] leading-[22px] transition-colors duration-200",
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

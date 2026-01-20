"use client";

import type { Tag } from "@pickle/contracts";
import { Icon } from "@pickle/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  Input,
  ScrollArea,
  Select,
  type SelectOption,
  type SelectOptionValue,
  TAG_VARIANTS,
  UtilButton,
} from "@pickle/ui";
import { cn } from "@pickle/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import { useSessionContext } from "@/features/auth/model/SessionContext";
import { folderQueries } from "@/features/folder/model/folderQueries";
import { tagQueries } from "@/features/tag/model/tagQueries";
import { createClient } from "@/shared/lib/supabase/client";
import { NOTE_FILTER_TYPES } from "./NoteListFilter";

interface SearchNoteFilterProps {
  selectedType: SelectOptionValue;
  onTypeChange: (value: SelectOptionValue) => void;
  selectedFolderId: SelectOptionValue;
  onFolderChange: (value: SelectOptionValue) => void;
  selectedTagIds: string[];
  onTagsChange: (tagIds: string[]) => void;
  sort: "latest" | "oldest";
  onSortChange: (value: "latest" | "oldest") => void;
  totalCount?: number;
  query?: string;
}

export function SearchNoteFilter({
  selectedType,
  onTypeChange,
  selectedFolderId,
  onFolderChange,
  selectedTagIds,
  onTagsChange,
  sort,
  onSortChange,
  totalCount = 0,
  query = "",
}: SearchNoteFilterProps) {
  const client = createClient();
  const { workspace } = useSessionContext();
  const workspaceId = workspace?.id;

  const [tagFilterOpen, setTagFilterOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  // 폴더 목록 조회
  const { data: folders = [] } = useQuery(folderQueries.list(client));

  // 태그 목록 조회
  const { data: tags = [] } = useQuery({
    ...tagQueries.list({ client, workspaceId }),
    enabled: !!workspaceId,
  });

  // 폴더 옵션 구성
  const folderOptions = useMemo<SelectOption[]>(() => {
    const defaultOptions: SelectOption[] = [
      { value: "all", label: "All Folders" },
      { value: "inbox", label: "Inbox" },
    ];

    const folderItems = folders.map((f) => ({
      value: f.id,
      label: f.name,
    }));

    return [...defaultOptions, ...folderItems];
  }, [folders]);

  // 검색 필터링된 태그 목록
  const filteredTags = useMemo<Tag[]>(() => {
    return tags.filter((tag) =>
      tag.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [tags, search]);

  const handleTagToggle = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onTagsChange(selectedTagIds.filter((id) => id !== tagId));
    } else {
      onTagsChange([...selectedTagIds, tagId]);
    }
  };

  return (
    <div>
      <div>
        <h1 className="pb-10 font-medium text-[20px] text-neutral-200">
          "{query}" 검색 결과 ({totalCount})
        </h1>
      </div>
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          {/* 타입 필터 */}
          <Select
            value={selectedType}
            onValueChange={onTypeChange}
            options={NOTE_FILTER_TYPES}
            placeholder="타입 선택"
          />

          {/* 폴더 필터 */}
          <Select
            value={selectedFolderId}
            onValueChange={onFolderChange}
            options={folderOptions}
            placeholder="폴더 선택"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="font-medium text-[14px] text-base-muted">
            총 {totalCount}개
          </span>

          <UtilButton
            icon="sort_16"
            variant="secondary_line"
            onClick={() =>
              onSortChange(sort === "latest" ? "oldest" : "latest")
            }
          >
            {sort === "latest" ? "최신순" : "오래된순"}
          </UtilButton>
        </div>
      </div>

      <div className="flex flex-wrap gap-2.5 pb-6">
        {/* 태그 선택 드롭다운 */}
        <DropdownMenu open={tagFilterOpen} onOpenChange={setTagFilterOpen}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "group/tag-filter",
                "inline-flex h-7 items-center gap-0.5 rounded-md border border-base-border-light bg-base-foreground-background px-[6px_8px] text-[13px] text-muted-foreground transition-colors",
                "hover:border-neutral-650 hover:bg-neutral-800 hover:text-base-foreground",
                tagFilterOpen &&
                  "border-neutral-500 bg-neutral-700 text-base-foreground",
              )}
            >
              <Icon
                name="tag_16"
                className={cn(
                  "transition-colors group-hover/tag-filter:text-neutral-300",
                  tagFilterOpen && "text-neutral-300",
                )}
              />
              태그선택
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            side="bottom"
            className={cn(
              "z-10000 h-auto max-h-[400px] w-[300px] p-0",
              "border border-base-border-light bg-neutral-850 shadow-standard",
            )}
          >
            <div className="flex min-h-9 flex-wrap items-center gap-1 border-base-border-light border-b bg-neutral-800 px-2 py-1.5 transition-all">
              <Input
                ref={inputRef}
                variant={"ghost"}
                size={"mini"}
                placeholder="태그 추가 및 검색"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-5 min-w-[60px] flex-1 border-none bg-transparent p-0 text-[13px] focus-visible:ring-0"
                autoFocus
              />
            </div>
            <div className="p-[5px]">
              <DropdownMenuLabel className="mb-1 font-normal text-neutral-500">
                태그 선택
              </DropdownMenuLabel>
              <ScrollArea className="h-full max-h-[260px] min-h-[160px] overflow-auto *:data-radix-scroll-area-viewport:max-h-[260px]">
                <ul className="space-y-0.5">
                  {filteredTags.map((tag) => {
                    const isSelected = selectedTagIds.includes(tag.id);
                    const style = TAG_VARIANTS[tag.style];
                    return (
                      <li
                        key={tag.id}
                        className={cn(
                          "group flex h-[30px] items-center rounded-[4px] px-1 transition-colors hover:bg-neutral-700",
                          isSelected && "bg-neutral-700",
                        )}
                      >
                        <div
                          className="grid flex-1 cursor-pointer grid-cols-[1fr_auto] items-center gap-2"
                          role="button"
                          tabIndex={0}
                          onClick={() => handleTagToggle(tag.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              handleTagToggle(tag.id);
                            }
                          }}
                        >
                          <div className={cn("flex")}>
                            <div
                              className={cn(
                                "grid h-5.5 grid-cols-1 items-center truncate rounded-[4px] border px-1.5 text-[12px] transition-colors duration-200",
                                style.tagColor,
                              )}
                            >
                              <span className="truncate">#{tag.name}</span>
                            </div>
                          </div>
                        </div>
                        <div className="ml-auto flex size-6.5 shrink-0 items-center justify-center gap-2">
                          {isSelected && (
                            <Icon
                              name="check_16"
                              className="text-base-primary"
                            />
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </ScrollArea>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 선택된 태그 나열 */}
        {selectedTagIds.map((id) => {
          const tag = (tags as Tag[]).find((t) => t.id === id);
          if (!tag) return null;
          const style = TAG_VARIANTS[tag.style];
          return (
            <div
              key={tag.id}
              className={cn(
                "flex h-7 items-center gap-1 rounded-md border px-2 text-[12px] transition-all",
                style.tagColor,
              )}
            >
              <span>#{tag.name}</span>
              <button
                type="button"
                onClick={() => handleTagToggle(tag.id)}
                className="flex size-4 items-center justify-center rounded-full"
              >
                <Icon name="delete_16" className={cn(style.buttonColor)} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

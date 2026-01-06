"use client";
import { Icon } from "@pickle/icons";
import { Select, type SelectOptionValue } from "@pickle/ui";
import { cn } from "@pickle/ui/lib/utils";
import { useState } from "react";

const TYPES = [
  { value: "all", label: "All Types" },
  { value: "text", label: "Text" },
  { value: "image", label: "Image" },
  { value: "capture", label: "Capture" },
  { value: "bookmark", label: "Bookmark" },
];

export function NoteListFilter({
  selectedType,
  onTypeChange,
  totalCount = 0,
}: {
  selectedType: SelectOptionValue;
  onTypeChange: (value: SelectOptionValue) => void;
  totalCount?: number;
}) {
  const [listForm, setListForm] = useState<"card" | "list">("card");

  return (
    <div className="flex items-center justify-between pb-7.5">
      <div className="flex items-center gap-2">
        <Select
          value={selectedType}
          onValueChange={onTypeChange}
          options={TYPES}
        />
        {/*  노트카드 레이아웃 버튼 */}
        <div className="flex h-9 items-center rounded-lg border border-base-border-light px-[2px]">
          <button
            type="button"
            className={cn(
              "inline-flex size-7.5 items-center justify-center rounded-md text-base-muted",
              listForm === "card" &&
                "bg-base-primary-active-background text-base-primary",
            )}
            onClick={() => setListForm("card")}
          >
            <Icon name="layout_card_16" className="text-inherit" />
          </button>
          <button
            type="button"
            className={cn(
              "inline-flex size-7.5 items-center justify-center rounded-md text-base-muted",
              listForm === "list" &&
                "bg-base-primary-active-background text-base-primary",
            )}
            onClick={() => setListForm("list")}
          >
            <Icon name="layout_list_16" className="text-inherit" />
          </button>
        </div>
      </div>
      {/* 총 노트 수 */}
      <span className="font-medium text-[14px] text-base-muted">
        총 {totalCount}개
      </span>
    </div>
  );
}

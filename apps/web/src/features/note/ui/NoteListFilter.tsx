"use client";
import { Icon } from "@pickle/icons";
import { Select, type SelectOptionValue, UtilButton } from "@pickle/ui";
import { useQueryClient } from "@tanstack/react-query";
import { noteKeys } from "../model/noteQueries";

export const NOTE_FILTER_TYPES = [
  { value: "all", label: "All Types" },
  { value: "bookmark", label: "URL" },
  { value: "image", label: "IMAGE" },
  { value: "text", label: "TEXT" },
];

export function NoteListFilter({
  selectedType,
  onTypeChange,
  sort,
  onSortChange,
  totalCount = 0,
  filteredCount = 0,
}: {
  selectedType: SelectOptionValue;
  onTypeChange: (value: SelectOptionValue) => void;
  sort: "latest" | "oldest";
  onSortChange: (value: "latest" | "oldest") => void;
  totalCount?: number;
  filteredCount?: number;
}) {
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries({
      queryKey: noteKeys.all,
    });
  };

  const selectedLabel = NOTE_FILTER_TYPES.find(
    (t) => t.value === selectedType,
  )?.label;

  return (
    <div className="flex items-center justify-between pb-7.5">
      <div className="flex items-center gap-2">
        <Select
          value={selectedType}
          onValueChange={onTypeChange}
          options={NOTE_FILTER_TYPES}
        />

        {/* retry */}
        <div className="flex size-9 items-center justify-center rounded-lg border border-base-border-light bg-form-input-background px-[2px]">
          <button
            type="button"
            className="group inline-flex size-7.5 items-center justify-center rounded-md text-base-muted transition-all hover:bg-base-foreground-background hover:text-neutral-300 active:scale-95"
            onClick={handleRefresh}
          >
            <Icon name="refresh_16" className="text-inherit" />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {/* 총 노트 수 및 필터링 상세 */}
        <span className="font-medium text-[14px] text-base-muted">
          총 {totalCount}개
          {selectedType !== "all" && (
            <span className="ml-1 text-base-muted-foreground">
              ({selectedLabel} {filteredCount}개)
            </span>
          )}
        </span>

        <UtilButton
          icon="sort_16"
          variant="secondary_line"
          onClick={() => onSortChange(sort === "latest" ? "oldest" : "latest")}
        >
          {sort === "latest" ? "최신순" : "오래된순"}
        </UtilButton>
      </div>
    </div>
  );
}

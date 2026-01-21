"use client";

import type { NoteWithAsset, Tag, TagColor } from "@pickle/contracts";
import { Icon } from "@pickle/icons";
import {
  ActionButton,
  Select,
  TAG_VARIANTS,
  TagMaker,
  TextareaContainLabel,
} from "@pickle/ui";
import { cn } from "@pickle/ui/lib/utils";
import { TypeLabel } from "@/features/note/ui/TypeLabel";
import { BookmarkButton } from "../../ui/BookmarkButton";

interface NoteFormFieldsProps {
  note: NoteWithAsset;
  currentNote: NoteWithAsset;
  localNote: {
    title: string;
    memo: string;
    text: string;
    tags: string[];
    folder_id: string | null;
  };
  setLocalNote: React.Dispatch<
    React.SetStateAction<{
      title: string;
      memo: string;
      text: string;
      tags: string[];
      folder_id: string | null;
    }>
  >;
  errors: {
    title?: string;
    text?: string;
  };
  allTags: Tag[];
  folders: { id: string; name: string }[];
  isTagMakerOpen: boolean;
  setIsTagMakerOpen: (open: boolean) => void;
  readOnly?: boolean;
  onCreateTag: (name: string, style: TagColor) => Promise<string>;
  onUpdateTag: (tagId: string, updates: Partial<Tag>) => void;
  onDeleteTag: (tagId: string) => void;
}

export function NoteFormFields({
  note,
  currentNote,
  localNote,
  setLocalNote,
  errors,
  allTags,
  folders,
  isTagMakerOpen,
  setIsTagMakerOpen,
  readOnly,
  onCreateTag,
  onUpdateTag,
  onDeleteTag,
}: NoteFormFieldsProps) {
  return (
    <div className="px-5">
      {/* 라벨 및 북마크 버튼 */}
      <div className="flex items-center justify-between pb-3">
        <TypeLabel type={note.type} mode="detail" />

        {/* 북마크 버튼 - 즉시 저장 유지 */}
        {!readOnly && (
          <BookmarkButton
            noteId={note.id}
            active={!!currentNote.bookmarked_at}
          />
        )}
      </div>

      {/* form */}
      <div className="mb-6 flex flex-col gap-2 border-base-border-light border-b pb-3">
        {/* TITLE */}
        <TextareaContainLabel
          label="TITLE"
          value={localNote.title || ""}
          onChange={(e) =>
            setLocalNote((prev) => ({
              ...prev,
              title: e.target.value,
            }))
          }
          required
          error={errors.title}
          readOnly={readOnly}
        />

        {currentNote.type === "text" && (
          <TextareaContainLabel
            label="TEXT"
            value={localNote.text || ""}
            onChange={(e) =>
              setLocalNote((prev) => ({
                ...prev,
                text: e.target.value,
              }))
            }
            required
            error={errors.text}
            readOnly={readOnly}
          />
        )}

        <URLComponent url={currentNote.url || ""} readOnly={readOnly} />

        {/* MEMO */}
        <TextareaContainLabel
          label="MEMO"
          value={localNote.memo || ""}
          onChange={(e) =>
            setLocalNote((prev) => ({
              ...prev,
              memo: e.target.value,
            }))
          }
          readOnly={readOnly}
        />
      </div>

      {/* FOLDERS */}
      <div className="mb-5 border-base-border-light border-b pb-3">
        <div className="flex h-9 items-center justify-between">
          <span className="font-semibold text-[13px] text-neutral-600 leading-none tracking-wider">
            FOLDERS
          </span>
        </div>
        <Select
          value={localNote.folder_id ?? "inbox"}
          onValueChange={(val) =>
            setLocalNote((prev) => ({
              ...prev,
              folder_id: val === "inbox" ? null : val,
            }))
          }
          options={[
            { value: "inbox", label: "Inbox" },
            ...folders.map((f) => ({ value: f.id, label: f.name })),
          ]}
          disabled={readOnly}
        />
      </div>

      {/* TAGS */}
      <div className="mb-5 border-base-border-light border-b pb-3">
        <div className="flex h-9 items-center justify-between">
          <span className="font-semibold text-[13px] text-neutral-600 leading-none tracking-wider">
            TAGS
          </span>
          <TagMaker
            open={isTagMakerOpen}
            onOpenChange={setIsTagMakerOpen}
            tags={allTags}
            selectedTagIds={localNote.tags || []}
            onSetTags={(tagIds) =>
              setLocalNote((prev) => ({ ...prev, tags: tagIds }))
            }
            onCreateTag={onCreateTag}
            onUpdateTag={onUpdateTag}
            onDeleteTag={onDeleteTag}
            trigger={
              readOnly ? null : (
                <ActionButton
                  icon="plus_16"
                  onClick={() => setIsTagMakerOpen(!isTagMakerOpen)}
                  forceFocus={isTagMakerOpen}
                />
              )
            }
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {localNote.tags?.map((tagId) => {
            const tag = allTags.find((t) => t.id === tagId);
            if (!tag) return null;
            const style = TAG_VARIANTS[tag.style];
            return (
              <div
                key={tag.id}
                className={cn(
                  "grid h-[26px] grid-cols-[1fr_auto] items-center gap-0.5 rounded-[4px] border px-1.5",
                  style.tagColor,
                )}
              >
                <span className="truncate text-[12px]">#{tag.name}</span>
                <button
                  type="button"
                  className={cn(
                    "ml-0.5 flex size-4 items-center justify-center rounded-full transition-colors hover:bg-black/10",
                  )}
                  onClick={() =>
                    setLocalNote((prev) => ({
                      ...prev,
                      tags: prev.tags?.filter((id) => id !== tag.id),
                    }))
                  }
                >
                  <Icon name="delete_16" className={cn(style.buttonColor)} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const URLComponent = ({
  url,
  readOnly,
}: {
  url: string;
  readOnly?: boolean;
}) => {
  if (!url) return null;

  return (
    <div
      className={cn(
        "w-full min-w-0 rounded-md p-3",
        "border border-form-input-border bg-form-input-background text-base-foreground outline-none",
        "break-all text-base placeholder:text-form-input-placeholder",
        "selection:bg-base-muted-foreground",
      )}
    >
      <div className="flex items-center justify-between pb-1 leading-none">
        <div className="flex items-center">
          <span className="font-semibold text-[12px] text-neutral-600 leading-none">
            URL
          </span>
          <span className="text-[12px] text-base-muted leading-none">*</span>
        </div>
        {!readOnly && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "cursor-pointer text-base-muted hover:text-neutral-300 active:scale-95",
            )}
            title="URL 복사"
          >
            <Icon name="link_12" className="text-inherit" />
          </a>
        )}
      </div>
      <p className="block text-[14px] text-form-input-disabled-foreground leading-[1.3] underline-offset-3 transition-[color,underline]">
        {url}
      </p>
    </div>
  );
};

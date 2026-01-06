import type { NoteWithAsset, Tag, TagColor } from "@pickle/contracts";
import { Icon } from "@pickle/icons";
import {
  ActionButton,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  ScrollArea,
  TAG_VARIANTS,
  TagMaker,
  TextareaContainLabel,
  useDialogController,
} from "@pickle/ui";
import { cn } from "@pickle/ui/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { type HTMLAttributes, useState } from "react";
import { getNote } from "@/features/note/api/getNote";
import { useUpdateNoteMutation } from "@/features/note/model/useUpdateNoteMutation";
import { Thumbnail } from "@/features/note/ui/thumbnail/Thumbnail";
import { createTag as createTagApi } from "@/features/tag/api/createTag";
import { deleteTag as deleteTagApi } from "@/features/tag/api/deleteTag";
import { getTags } from "@/features/tag/api/getTags";
import { setNoteTags } from "@/features/tag/api/noteTags";
import { updateTag as updateTagApi } from "@/features/tag/api/updateTag";

interface NoteDetailDrawerProps {
  note: NoteWithAsset;
}

const TYPE_LABELS: Record<string, string> = {
  text: "TEXT",
  image: "IMAGE",
  capture: "CAPTURE",
  bookmark: "URL",
} as const;

const type_per_class: Record<
  NoteWithAsset["type"],
  HTMLAttributes<"span">["className"]
> = {
  text: "font-medium text-[14px] text-blue-500 tracking-wider",
  image: "font-medium text-[14px] text-green-500 tracking-wider",
  capture: "font-medium text-[14px] text-green-500 tracking-wider",
  bookmark: "font-medium text-[14px] text-yellow-500 tracking-wider",
};

const type_per_icon: Record<
  NoteWithAsset["type"],
  HTMLAttributes<"span">["className"]
> = {
  text: "flex items-center justify-center size-6 rounded-sm bg-blue-500/10",
  image: "flex items-center justify-center size-6 rounded-sm bg-green-500/10",
  capture: "flex items-center justify-center size-6 rounded-sm bg-green-500/10",
  bookmark:
    "flex items-center justify-center size-6 rounded-sm bg-yellow-500/10",
};

export default function NoteDetailDrawer({ note }: NoteDetailDrawerProps) {
  const { isOpen, zIndex, unmount, close } = useDialogController();
  const queryClient = useQueryClient();

  const { mutate: updateNote } = useUpdateNoteMutation();
  const [isTagMakerOpen, setIsTagMakerOpen] = useState<boolean>(false);
  const [isMove, setIsMove] = useState<boolean>(false);
  const [noteData, setNoteData] = useState<NoteWithAsset>(note);

  // 1. 개별 노트 정보 조회 (실시간 동기화용)
  const { data: currentNote = note } = useQuery({
    queryKey: ["notes", note.id],
    queryFn: () => getNote(note.id),
    initialData: note,
  });

  // 2. 전체 태그 목록 조회 (Workspace 기준)
  const { data: allTags = [] } = useQuery({
    queryKey: ["tags", note.workspace_id],
    queryFn: () => getTags(note.workspace_id),
    enabled: !!note.workspace_id,
  });

  // 3. 태그 조작 Mutations
  const createTagMutation = useMutation({
    mutationFn: (input: { name: string; style: TagColor }) =>
      createTagApi({ ...input, workspace_id: note.workspace_id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags", note.workspace_id] });
    },
  });

  const updateTagMutation = useMutation({
    mutationFn: ({
      tagId,
      updates,
    }: {
      tagId: string;
      updates: Partial<Tag>;
    }) => updateTagApi(tagId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags", note.workspace_id] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["notes", note.id] });
    },
  });

  const deleteTagMutation = useMutation({
    mutationFn: (tagId: string) => deleteTagApi(tagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags", note.workspace_id] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["notes", note.id] });
    },
  });

  const setTagsMutation = useMutation({
    mutationFn: (tagIds: string[]) => setNoteTags(note.id, tagIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["notes", note.id] });
    },
  });

  // 현재 노트의 태그 ID들 (실시간 데이터 기준)
  const selectedTagIds = currentNote.tag_list?.map((t) => t.id) || [];
  return (
    <AnimatePresence onExitComplete={unmount}>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-end"
          style={{ zIndex: zIndex }}
        >
          {/* overlay */}
          <motion.div
            className="absolute inset-0 z-10 bg-neutral-950/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
          />

          {/* drawer */}
          <motion.div
            className="relative z-20 mr-[15px] grid h-[calc(100%-30px)] w-90 grid-rows-[auto_1fr_auto] rounded-[16px] border border-base-border-light bg-base-foreground-background py-5 shadow-standard"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.2 }}
          >
            {/* drawer header */}
            <header className="flex justify-between px-5 pb-5">
              <span className="inline-flex items-center gap-2 font-semibold text-[18px] text-base-foreground">
                <Icon name="archive_20" className="text-inherit" /> Inbox
              </span>
              <DropdownMenu open={isMove} onOpenChange={setIsMove}>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "flex items-center gap-0.5 rounded-[6px] border border-base-border-light bg-neutral-800 px-1.5 text-[12px] text-base-muted-foreground transition-colors hover:text-base-foreground",
                      isMove && "text-base-foreground",
                    )}
                  >
                    <Icon name="move_16" /> 옮기기
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="bottom"
                  align="end"
                  className="z-1000 w-40"
                >
                  <ScrollArea className="h-auto max-h-[148px] *:data-radix-scroll-area-viewport:max-h-[148px]">
                    <DropdownMenuLabel>이동할 폴더 선택</DropdownMenuLabel>
                    {[
                      "폴더1",
                      "폴더2",
                      "폴더3",
                      "폴더4",
                      "폴더5",
                      "폴더6",
                      "폴더7",
                      "폴더8",
                      "폴더9",
                      "폴더10",
                      "폴더11",
                      "폴더12",
                      "폴더13",
                      "폴더14",
                      "폴더15",
                      "폴더16",
                      "폴더17",
                      "폴더18",
                      "폴더19",
                      "폴더20",
                    ].map((folder) => (
                      <DropdownMenuItem asChild key={folder}>
                        <button
                          type="button"
                          className="grid w-full grid-cols-[auto_1fr] items-center gap-2 text-left"
                        >
                          <Icon name="folder_20" className="shrink-0" />
                          <span className="w-full truncate">{folder}</span>
                        </button>
                      </DropdownMenuItem>
                    ))}
                  </ScrollArea>
                </DropdownMenuContent>
              </DropdownMenu>
            </header>

            {/* drawer content */}
            <ScrollArea className="h-full overflow-auto">
              <div className="px-5">
                {/* type : image | capture | bookmark 일때 썸네일 */}

                <Thumbnail
                  note={note}
                  className="mb-5 h-[200px] overflow-clip rounded-xl"
                />
                {/* 라벨 및 북마크 버튼 */}
                <div className="flex items-center justify-between pb-3">
                  <div className="flex items-center gap-1.5">
                    <div className={type_per_icon[note.type]}>
                      {note.type === "bookmark" && (
                        <img src="/type-01.svg" alt="bookmark type icon" />
                      )}
                      {(note.type === "image" || note.type === "capture") && (
                        <img src="/type-02.svg" alt="img type icon" />
                      )}
                      {note.type === "text" && (
                        <img src="/type-03.svg" alt="text type icon" />
                      )}
                    </div>
                    <span className={type_per_class[note.type]}>
                      {TYPE_LABELS[note.type] || note.type.toUpperCase()}
                    </span>
                  </div>

                  {/* 북마크 버튼 */}
                  <button
                    type="button"
                    onClick={() => {
                      const isBookmarked = !!currentNote.bookmarked_at;
                      const newBookmarkedAt = isBookmarked
                        ? null
                        : new Date().toISOString();
                      updateNote({
                        noteId: currentNote.id,
                        payload: { bookmarked_at: newBookmarkedAt },
                      });
                    }}
                  >
                    <Icon
                      name="bookmark_20"
                      className={cn(
                        "transition-colors group-hover:text-neutral-300",
                        !!currentNote.bookmarked_at &&
                          "text-base-primary group-hover:text-base-primary",
                      )}
                    />
                  </button>
                </div>

                {/* form */}
                <div className="mb-6 flex flex-col gap-2 border-base-border-light border-b pb-3">
                  {/* TITLE */}
                  <TextareaContainLabel
                    label="TITLE"
                    value={noteData.title || ""}
                    onChange={(e) =>
                      setNoteData({ ...noteData, title: e.target.value })
                    }
                    required
                  />

                  {/* CONTENT */}
                  {noteData.type === "text" && (
                    <TextareaContainLabel
                      label="CONTENT"
                      value={noteData.data.text || ""}
                      onChange={(e) =>
                        setNoteData({
                          ...noteData,
                          data: { ...noteData.data, text: e.target.value },
                        })
                      }
                      required
                    />
                  )}
                  {/* URL */}
                  <TextareaContainLabel
                    label="URL"
                    value={noteData.meta?.url || ""}
                    onChange={(e) =>
                      setNoteData({
                        ...noteData,
                        meta: { ...noteData.meta, url: e.target.value },
                      })
                    }
                    required
                  />
                  {/* MEMO */}
                  <TextareaContainLabel
                    label="MEMO"
                    value={noteData.memo || ""}
                    onChange={(e) =>
                      setNoteData({ ...noteData, memo: e.target.value })
                    }
                  />
                </div>
                <div className="mb-5 border-base-border-light border-b pb-3">
                  <div className="flex h-9 items-center justify-between">
                    <span className="font-semibold text-[13px] text-neutral-600 leading-none tracking-wider">
                      TAGS
                    </span>
                    <TagMaker
                      open={isTagMakerOpen}
                      onOpenChange={setIsTagMakerOpen}
                      tags={allTags}
                      selectedTagIds={selectedTagIds}
                      onSetTags={(tagIds) => setTagsMutation.mutate(tagIds)}
                      onCreateTag={async (name, style) => {
                        const newTag = await createTagMutation.mutateAsync({
                          name,
                          style,
                        });
                        return newTag.id;
                      }}
                      onUpdateTag={(tagId, updates) =>
                        updateTagMutation.mutate({ tagId, updates })
                      }
                      onDeleteTag={(tagId) => deleteTagMutation.mutate(tagId)}
                      trigger={
                        <ActionButton
                          icon="plus_16"
                          onClick={() => setIsTagMakerOpen(!isTagMakerOpen)}
                          forceFocus={isTagMakerOpen}
                        />
                      }
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {currentNote.tag_list?.map((tag) => {
                      const style = TAG_VARIANTS[tag.style];
                      return (
                        <div
                          key={tag.id}
                          className={cn(
                            "grid h-[26px] grid-cols-[1fr_auto] items-center gap-0.5 rounded-[4px] border px-1.5",
                            style.tagColor,
                          )}
                        >
                          <span className="truncate text-[13px]">
                            #{tag.name}
                          </span>
                          <button
                            type="button"
                            className={cn(
                              "ml-0.5 flex size-4 items-center justify-center rounded-full transition-colors hover:bg-black/10",
                            )}
                            onClick={() =>
                              setTagsMutation.mutate(
                                selectedTagIds.filter((id) => id !== tag.id),
                              )
                            }
                          >
                            <Icon
                              name="delete_16"
                              className={cn(
                                TAG_VARIANTS[tag.style].buttonColor,
                              )}
                            />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="pb-20">
                  <div className="mb-[8.5px] flex h-9 items-center justify-between">
                    <span className="font-semibold text-[13px] text-neutral-600 leading-none tracking-wider">
                      DETAILS
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {(note.type === "image" || note.type === "capture") && (
                      <>
                        <dl className="flex items-center">
                          <dt className="w-[70px] text-[12px] text-neutral-500 leading-none">
                            파일 종류
                          </dt>
                          <dd className="text-[13px] text-neutral-500 leading-none">
                            webp 이미지
                          </dd>
                        </dl>
                        <dl className="flex items-center">
                          <dt className="w-[70px] text-[12px] text-neutral-500 leading-none">
                            파일 크기
                          </dt>
                          <dd className="text-[13px] text-neutral-500 leading-none">
                            129,344 bytes
                          </dd>
                        </dl>
                      </>
                    )}

                    <dl className="flex items-center">
                      <dt className="w-[70px] text-[12px] text-neutral-500 leading-none">
                        등록일
                      </dt>
                      <dd className="text-[13px] text-neutral-500 leading-none">
                        {new Date(note.created_at).toLocaleDateString("ko-KR")}
                      </dd>
                    </dl>
                    <dl className="flex items-center">
                      <dt className="w-[70px] text-[12px] text-neutral-500 leading-none">
                        수정일
                      </dt>
                      <dd className="text-[13px] text-neutral-500 leading-none">
                        {new Date(note.updated_at).toLocaleDateString("ko-KR")}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </ScrollArea>

            {/* drawer footer */}
            <div className="flex gap-2 border-base-border-light border-t px-5 pt-5">
              <Button variant="icon" icon="trash_20" />
              <Button className="flex-1">저장하기</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

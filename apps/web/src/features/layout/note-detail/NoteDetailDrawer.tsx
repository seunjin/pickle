"use client";
import type { NoteWithAsset, Tag, TagColor } from "@pickle/contracts";
import { Icon } from "@pickle/icons";
import {
  ActionButton,
  Button,
  Confirm,
  ScrollArea,
  Select,
  TAG_VARIANTS,
  TagMaker,
  TextareaContainLabel,
  useDialog,
  useDialogController,
  useToast,
} from "@pickle/ui";
import { cn } from "@pickle/ui/lib/utils";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { folderQueries } from "@/features/folder/model/folderQueries";
import { getNote } from "@/features/note/api/getNote";
import { useDeleteNoteMutation } from "@/features/note/model/useDeleteNoteMutation";
import { useUpdateNoteMutation } from "@/features/note/model/useUpdateNoteMutation";
import { TypeLabel } from "@/features/note/ui/TypeLabel";
import { Thumbnail } from "@/features/note/ui/thumbnail/Thumbnail";
import { createTag as createTagApi } from "@/features/tag/api/createTag";
import { deleteTag as deleteTagApi } from "@/features/tag/api/deleteTag";
import { setNoteTags } from "@/features/tag/api/noteTags";
import { updateTag as updateTagApi } from "@/features/tag/api/updateTag";
import { tagQueries } from "@/features/tag/model/tagQueries";
import { formatDate } from "@/shared/lib/date";
import { formatBytes } from "@/shared/lib/file";
import { logger } from "@/shared/lib/logger";
import { createClient } from "@/shared/lib/supabase/client";
import { BookmarkButton } from "../ui/BookmarkButton";

interface NoteDetailDrawerProps {
  note: NoteWithAsset;
  readOnly?: boolean;
}

export function NoteDetailDrawer({ note, readOnly }: NoteDetailDrawerProps) {
  const { isOpen, zIndex, unmount, close } = useDialogController();
  const dialog = useDialog();
  const queryClient = useQueryClient();
  const client = createClient();
  const toast = useToast();

  const updateNoteMutation = useUpdateNoteMutation();
  const { mutateAsync: updateNote } = updateNoteMutation;
  const deleteNoteMutation = useDeleteNoteMutation();
  const { mutateAsync: deleteNote } = deleteNoteMutation;
  const [isTagMakerOpen, setIsTagMakerOpen] = useState<boolean>(false);
  const [thumbnailDetailOpen, setThumbnailDetailOpen] =
    useState<boolean>(false);
  // ✅ Sidebar prefetch 재사용 (추가 API 호출 없음!)
  const { data: folders = [] } = useSuspenseQuery(folderQueries.list(client));

  // 1. 개별 노트 정보 조회 (실시간 동기화용)
  const { data: currentNote = note } = useQuery({
    queryKey: ["notes", note.id],
    queryFn: () => getNote(note.id),
    initialData: note,
  });

  // ✅ 로컬 상태 관리 (수동 저장) - meta는 피드백에 따라 제외
  const [localNote, setLocalNote] = useState({
    title: currentNote.title || "",
    memo: currentNote.memo || "",
    text: currentNote.type === "text" ? currentNote.data.text : "",
    tags: currentNote.tag_list?.map((t) => t.id) || [],
    folder_id: currentNote.folder_id,
  });

  const [hasChanges, setHasChanges] = useState(false);

  // ✅ 변경 감지
  useEffect(() => {
    const isChanged =
      localNote.title !== (currentNote.title || "") ||
      localNote.memo !== (currentNote.memo || "") ||
      localNote.text !==
        (currentNote.type === "text" ? currentNote.data.text : "") ||
      localNote.folder_id !== currentNote.folder_id ||
      JSON.stringify([...(localNote.tags || [])].sort()) !==
        JSON.stringify(
          [...(currentNote.tag_list?.map((t) => t.id) || [])].sort(),
        );

    setHasChanges(isChanged);
  }, [localNote, currentNote]);

  // ✅ 폼 검증 로직
  const errors = {
    title: !localNote.title.trim() ? "TITLE을 입력해 주세요." : undefined,
    text:
      currentNote.type === "text" && !localNote.text.trim()
        ? "TEXT를 입력해 주세요."
        : undefined,
  };

  const isValid = !errors.title && !errors.text;

  // 2. 전체 태그 목록 조회 (Workspace 기준)
  const { data: allTags = [] } = useQuery(tagQueries.list());

  // 3. 태그 조작 Mutations
  const createTagMutation = useMutation({
    mutationFn: (input: { name: string; style: TagColor }) =>
      createTagApi({ ...input, workspace_id: note.workspace_id }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: tagQueries.list().queryKey,
      });
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
      queryClient.invalidateQueries({
        queryKey: tagQueries.list().queryKey,
      });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["notes", note.id] });
    },
  });

  const deleteTagMutation = useMutation({
    mutationFn: (tagId: string) => deleteTagApi(tagId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: tagQueries.list().queryKey,
      });
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

  const isSavePending =
    updateNoteMutation.isPending || setTagsMutation.isPending;

  // ✅ 저장 중 혹은 변경사항 있을 때 새로고침 방지
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges || isSavePending) {
        e.preventDefault();
        e.returnValue = ""; // 현대 브라우저에서는 이 값이 있어야 경고창이 뜹니다.
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges, isSavePending]);

  // 닫기 핸들러 (변경사항 확인)
  const handleClose = () => {
    if (isSavePending) {
      toast.error({
        title: "저장 중에는 닫을 수 없습니다.",
        description: "잠시만 기다려 주세요.",
      });
      return;
    }

    if (hasChanges) {
      dialog.open(() => (
        <Confirm
          title="변경사항이 있습니다"
          content={`저장하지 않은 변경사항이 사라집니다.\n정말 닫으시겠습니까?`}
          confirmButtonText="무시하고 닫기"
          cancelButtonText="취소"
          onConfirm={() => {
            close();
            dialog.close();
          }}
        />
      ));
    } else {
      dialog.close();
    }
  };

  // 저장 핸들러
  const handleSave = async () => {
    // 변경 사항이 없으면 바로 닫기
    if (!hasChanges) {
      close();
      return;
    }

    try {
      // 1. 기본 정보 업데이트
      await updateNote({
        noteId: note.id,
        payload: {
          title: localNote.title,
          memo: localNote.memo,
          data:
            currentNote.type === "text" ? { text: localNote.text } : undefined,
          folder_id: localNote.folder_id,
        },
      });

      // 2. 태그 업데이트
      if (localNote.tags) {
        await setTagsMutation.mutateAsync(localNote.tags);
      }

      setHasChanges(false);
      close(); // 저장 완료 후 닫기
    } catch (error) {
      logger.error("Failed to save note", { noteId: currentNote.id, error });
    }
  };

  const hasAssetType = note.type === "capture" || note.type === "image";
  const isBookmarkWithImage =
    note.type === "bookmark" && note.meta?.image_width;

  const width = hasAssetType
    ? note.assets?.width
    : isBookmarkWithImage
      ? note.meta?.image_width
      : null;
  const height = hasAssetType
    ? note.assets?.height
    : isBookmarkWithImage
      ? note.meta?.image_height
      : null;

  const noteThumbnailWidth = width ? `${width}px` : "auto";
  const noteThumbnailHeight = height ? `${height}px` : "auto";

  return (
    <AnimatePresence onExitComplete={unmount}>
      {isOpen && (
        <div
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
            onClick={handleClose}
          />
          {/* Thumbnail Detail */}
          <motion.div
            className="relative z-20 flex h-[calc(100%-30px)] w-[calc(calc(100dvh-30px)+15px+360px+15px)] justify-end gap-[15px] px-[15px]"
            initial={
              thumbnailDetailOpen ? { opacity: 0, x: "100%" } : undefined
            }
            animate={thumbnailDetailOpen ? { opacity: 1, x: 0 } : undefined}
            exit={thumbnailDetailOpen ? { opacity: 0, x: "100%" } : undefined}
            transition={thumbnailDetailOpen ? { duration: 0.5 } : undefined}
            onClick={(_e) => {
              setThumbnailDetailOpen(false);
              handleClose();
            }}
          >
            <AnimatePresence>
              {thumbnailDetailOpen && (
                <motion.div
                  className="relative z-20 grid h-full w-[calc(100dvh-30px)] max-w-[calc(100dvh-30px)] flex-1 grid-rows-[1fr] rounded-[16px] border border-base-border-light bg-base-foreground-background py-5 shadow-standard"
                  initial={{ opacity: 0, x: "70%" }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: "70%" }}
                  transition={{ duration: 0.3 }}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <header className="absolute top-3 right-3 z-10 flex items-center justify-end gap-2">
                    <ActionButton icon="download_16" />
                    <ActionButton
                      icon="delete_16"
                      onClick={() => setThumbnailDetailOpen(false)}
                    />
                  </header>
                  <div className="flex h-full items-center justify-center">
                    <Thumbnail
                      note={note}
                      className={cn("h-full w-full")}
                      objectFit="scale-down"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* drawer */}
            <motion.div
              className="relative z-30 grid h-full w-90 shrink-0 grid-rows-[auto_1fr_auto] rounded-[16px] border border-base-border-light bg-base-foreground-background py-5 shadow-standard"
              initial={
                !thumbnailDetailOpen ? { opacity: 0, x: "100%" } : undefined
              }
              animate={!thumbnailDetailOpen ? { opacity: 1, x: 0 } : undefined}
              exit={
                !thumbnailDetailOpen ? { opacity: 0, x: "100%" } : undefined
              }
              transition={!thumbnailDetailOpen ? { duration: 0.3 } : undefined}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              {/* drawer content */}
              <ScrollArea className="h-full overflow-auto">
                <div className="px-5">
                  {/* type : image | capture | bookmark 일때 썸네일 */}
                  <div
                    role="button"
                    tabIndex={0}
                    className="cursor-pointer rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-base-primary"
                    onClick={() => setThumbnailDetailOpen(!thumbnailDetailOpen)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setThumbnailDetailOpen(!thumbnailDetailOpen);
                      }
                    }}
                  >
                    <Thumbnail
                      note={note}
                      className="mb-5 h-[200px] overflow-clip rounded-xl"
                    />
                  </div>

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

                    <URLComponent
                      url={currentNote.url || ""}
                      readOnly={readOnly}
                    />

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
                        selectedTagIds={localNote.tags || []} // 로컬 상태 연결
                        onSetTags={(tagIds) =>
                          setLocalNote((prev) => ({ ...prev, tags: tagIds }))
                        } // 로컬 상태 업데이트
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
                            <span className="truncate text-[12px]">
                              #{tag.name}
                            </span>
                            <button
                              type="button"
                              className={cn(
                                "ml-0.5 flex size-4 items-center justify-center rounded-full transition-colors hover:bg-black/10",
                              )}
                              onClick={() =>
                                setLocalNote((prev) => ({
                                  ...prev,
                                  tags: prev.tags?.filter(
                                    (id) => id !== tag.id,
                                  ),
                                }))
                              }
                            >
                              <Icon
                                name="delete_16"
                                className={cn(style.buttonColor)}
                              />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* DETAILS */}
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
                              {note.assets?.full_size_bytes
                                ? formatBytes(note.assets.full_size_bytes)
                                : "-"}
                            </dd>
                          </dl>
                        </>
                      )}
                      <dl className="flex items-center">
                        <dt className="w-[70px] text-[12px] text-neutral-500 leading-none">
                          등록일
                        </dt>
                        <dd className="text-[13px] text-neutral-500 leading-none">
                          {formatDate(note.created_at, "datetime")}
                        </dd>
                      </dl>
                      <dl className="flex items-center">
                        <dt className="w-[70px] text-[12px] text-neutral-500 leading-none">
                          수정일
                        </dt>
                        <dd className="text-[13px] text-neutral-500 leading-none">
                          {formatDate(note.updated_at, "datetime")}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              {/* drawer footer */}
              {!readOnly && (
                <div className="mt-auto flex gap-2 border-base-border-light border-t p-5 pb-0">
                  <Button
                    icon="trash_16"
                    variant={"icon"}
                    className="shrink-0"
                    onClick={() => {
                      dialog.open(() => (
                        <Confirm
                          title="노트 삭제"
                          content="이 노트를 삭제하시겠습니까?"
                          onConfirm={async () => {
                            try {
                              await deleteNote(note.id);
                              close();
                            } catch (error) {
                              logger.error("Failed to delete note", {
                                noteId: note.id,
                                error,
                              });
                            }
                          }}
                        />
                      ));
                    }}
                  />
                  <Button
                    className="flex-1"
                    isPending={isSavePending}
                    disabled={!isValid}
                    onClick={handleSave}
                  >
                    저장하기
                  </Button>
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

const URLComponent = ({
  url,
  readOnly,
}: {
  url: string;
  readOnly?: boolean;
}) => {
  return (
    <div
      className={cn(
        /* 1. 레이아웃 & 박스 모델 */
        "w-full min-w-0 rounded-md p-3",
        /* 2. 배경 & 테두리 & 그림자 */
        "border border-form-input-border bg-form-input-background text-base-foreground outline-none",
        /* 3. 타이포그래피 */
        "break-all text-base placeholder:text-form-input-placeholder",
        /* 4. 애니메이션 & 상태 전환 */
        // "transition-[color,box-shadow]",
        /* 5. 포커스 상태 (링 스타일) */
        // "focus-within:ring-1 focus-within:ring-base-primary",
        /* 6. 선택(Selection) 스타일 */
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

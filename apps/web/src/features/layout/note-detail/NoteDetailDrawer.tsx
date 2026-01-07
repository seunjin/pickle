import type { NoteWithAsset, Tag, TagColor } from "@pickle/contracts";
import { Icon } from "@pickle/icons";
import {
  ActionButton,
  Button,
  Confirm,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  ScrollArea,
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
import { type HTMLAttributes, useEffect, useState } from "react";
import { folderQueries } from "@/features/folder";
import { getNote } from "@/features/note/api/getNote";
import { useUpdateNoteMutation } from "@/features/note/model/useUpdateNoteMutation";
import { Thumbnail } from "@/features/note/ui/thumbnail/Thumbnail";
import { createTag as createTagApi } from "@/features/tag/api/createTag";
import { deleteTag as deleteTagApi } from "@/features/tag/api/deleteTag";
import { setNoteTags } from "@/features/tag/api/noteTags";
import { updateTag as updateTagApi } from "@/features/tag/api/updateTag";
import { tagQueries } from "@/features/tag/model/tagQueries";
import { createClient } from "@/shared/lib/supabase/client";

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
  const dialog = useDialog();
  const queryClient = useQueryClient();
  const client = createClient();
  const toast = useToast();

  const updateNoteMutation = useUpdateNoteMutation();
  const { mutateAsync: updateNote } = updateNoteMutation;
  const [isTagMakerOpen, setIsTagMakerOpen] = useState<boolean>(false);
  const [isMove, setIsMove] = useState<boolean>(false);

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
    url: currentNote.url || "",
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
      localNote.url !== (currentNote.url || "") ||
      localNote.text !==
        (currentNote.type === "text" ? currentNote.data.text : "") ||
      localNote.folder_id !== currentNote.folder_id ||
      JSON.stringify([...(localNote.tags || [])].sort()) !==
        JSON.stringify(
          [...(currentNote.tag_list?.map((t) => t.id) || [])].sort(),
        );

    setHasChanges(isChanged);
  }, [localNote, currentNote]);

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

  // 노트를 폴더로 이동 (로컬 상태만 업데이트)
  const handleMoveToFolder = (folderId: string | null) => {
    setLocalNote((prev) => ({ ...prev, folder_id: folderId }));
    setIsMove(false);
  };

  // 저장 핸들러
  const handleSave = async () => {
    try {
      // 1. 기본 정보 업데이트
      await updateNote({
        noteId: note.id,
        payload: {
          title: localNote.title,
          memo: localNote.memo,
          url: localNote.url,
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
    } catch (error) {
      console.error("Failed to save note:", error);
    }
  };

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
            onClick={handleClose}
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
            <header className="flex justify-between gap-2 px-5 pb-5">
              <div className="grid grid-cols-[auto_1fr] items-center gap-2">
                <Icon
                  name={localNote.folder_id ? "folder_20" : "archive_20"}
                  className="text-inherit"
                />
                <p className="truncate font-semibold text-[18px] text-base-foreground">
                  {localNote.folder_id
                    ? folders.find((f) => f.id === localNote.folder_id)?.name ||
                      "Folder"
                    : "Inbox"}
                </p>
              </div>
              <DropdownMenu open={isMove} onOpenChange={setIsMove}>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "flex shrink-0 items-center gap-0.5 rounded-[6px] border border-base-border-light bg-neutral-800 px-1.5 text-[12px] text-base-muted-foreground transition-colors hover:text-base-foreground",
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
                    {/* Inbox (folder_id = null) */}
                    <DropdownMenuItem asChild>
                      <button
                        type="button"
                        onClick={() => handleMoveToFolder(null)}
                        className="grid w-full grid-cols-[auto_1fr] items-center gap-2 text-left"
                      >
                        <Icon name="archive_20" className="shrink-0" />
                        <span className="w-full truncate">Inbox</span>
                      </button>
                    </DropdownMenuItem>
                    {/* 실제 폴더 목록 */}
                    {folders.map((folder) => (
                      <DropdownMenuItem asChild key={folder.id}>
                        <button
                          type="button"
                          onClick={() => handleMoveToFolder(folder.id)}
                          className="grid w-full grid-cols-[auto_1fr] items-center gap-2 text-left"
                        >
                          <Icon name="folder_20" className="shrink-0" />
                          <span className="w-full truncate">{folder.name}</span>
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

                  {/* 북마크 버튼 - 즉시 저장 유지 */}
                  <button
                    type="button"
                    onClick={() => {
                      const isBookmarked = !!currentNote.bookmarked_at;
                      const newBookmarkedAt = isBookmarked
                        ? null
                        : new Date().toISOString();
                      // 북마크는 updateNoteAsync를 기다리지 않고 낙관적으로 처리될 수 있음
                      updateNote({
                        noteId: currentNote.id,
                        payload: { bookmarked_at: newBookmarkedAt },
                      });
                    }}
                  >
                    <Icon
                      name="bookmark_20"
                      className={cn(
                        "transition-colors",
                        currentNote.bookmarked_at
                          ? "text-base-primary"
                          : "text-neutral-500",
                      )}
                    />
                  </button>
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
                      readOnly
                    />
                  )}

                  <TextareaContainLabel
                    label="URL"
                    value={localNote.url || ""}
                    onChange={(e) =>
                      setLocalNote((prev) => ({
                        ...prev,
                        url: e.target.value,
                      }))
                    }
                    required
                    readOnly
                  />

                  {/* CONTENT (현재는 읽기 전용 느낌이지만 일단 memo로 관리) */}
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
                      autoSave={false} // 자동 저장 비활성화
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
                          <span className="truncate text-[13px]">
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
                                tags: prev.tags?.filter((id) => id !== tag.id),
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

                <div className="pb-20">
                  <div className="mb-[8.5px] flex h-9 items-center justify-between">
                    <span className="font-semibold text-[13px] text-neutral-600 leading-none tracking-wider">
                      DETAILS
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
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
                    {/* {localNote.folder_id && (
                      <dl className="flex items-center">
                        <dt className="w-[70px] text-[12px] text-neutral-500 leading-none">
                          폴더
                        </dt>
                        <dd className="text-[13px] text-neutral-500 leading-none">
                          {folders.find((f) => f.id === localNote.folder_id)
                            ?.name || "알 수 없음"}
                        </dd>
                      </dl>
                    )} */}
                  </div>
                </div>
              </div>
            </ScrollArea>

            {/* drawer footer */}
            <div className="flex gap-2 border-base-border-light border-t px-5 pt-5">
              <Button variant="icon" icon="trash_20" />
              <Button
                className="flex-1"
                isPending={isSavePending}
                disabled={!hasChanges}
                onClick={handleSave}
              >
                저장하기
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

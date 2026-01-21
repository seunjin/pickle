"use client";

import type { NoteWithAsset, Tag, TagColor } from "@pickle/contracts";
import { Confirm, useDialog, useDialogController, useToast } from "@pickle/ui";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { folderQueries } from "@/features/folder/model/folderQueries";
import { getNote } from "@/features/note/api/getNote";
import { useDeleteNoteMutation } from "@/features/note/model/useDeleteNoteMutation";
import { useUpdateNoteMutation } from "@/features/note/model/useUpdateNoteMutation";
import { createTag as createTagApi } from "@/features/tag/api/createTag";
import { deleteTag as deleteTagApi } from "@/features/tag/api/deleteTag";
import { setNoteTags } from "@/features/tag/api/noteTags";
import { updateTag as updateTagApi } from "@/features/tag/api/updateTag";
import { tagQueries } from "@/features/tag/model/tagQueries";
import { logger } from "@/shared/lib/logger";
import { createClient } from "@/shared/lib/supabase/client";

interface UseNoteDetailProps {
  note: NoteWithAsset;
}

export function useNoteDetail({ note }: UseNoteDetailProps) {
  const { close, unmount, isOpen, zIndex } = useDialogController();
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

  // ✅ Sidebar prefetch 재사용
  const { data: folders = [] } = useSuspenseQuery(folderQueries.list(client));

  // 1. 개별 노트 정보 조회 (실시간 동기화용)
  const { data: currentNote = note } = useQuery({
    queryKey: ["notes", note.id],
    queryFn: () => getNote(note.id),
    initialData: note,
  });

  // ✅ 로컬 상태 관리
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

  // 2. 전체 태그 목록 조회
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
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges, isSavePending]);

  // 닫기 핸들러
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
          content={"저장하지 않은 변경사항이 사라집니다.\n정말 닫으시겠습니까?"}
          confirmButtonText="무시하고 닫기"
          cancelButtonText="취소"
          onConfirm={() => {
            close();
            dialog.close();
          }}
        />
      ));
    } else {
      close();
    }
  };

  // 저장 핸들러
  const handleSave = async () => {
    if (!hasChanges) {
      close();
      return;
    }

    try {
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

      if (localNote.tags) {
        await setTagsMutation.mutateAsync(localNote.tags);
      }

      setHasChanges(false);
      close();
    } catch (error) {
      logger.error("Failed to save note", { noteId: currentNote.id, error });
    }
  };

  const hasAssetType = note.type === "capture" || note.type === "image";

  const handleDownload = async () => {
    if (!hasAssetType || !note.assets) return;

    try {
      const { data } = client.storage
        .from("bitmaps")
        .getPublicUrl(note.assets.full_path);

      if (!data.publicUrl) throw new Error("Public URL not found");

      const response = await fetch(data.publicUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `pickle-note-${note.id}.webp`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      logger.error("Failed to download image", { noteId: note.id, error });
      toast.error({
        title: "다운로드 실패",
        description: "이미지를 다운로드하는 중 오류가 발생했습니다.",
      });
    }
  };

  return {
    // States
    isOpen,
    zIndex,
    unmount,
    currentNote,
    localNote,
    setLocalNote,
    hasChanges,
    isValid,
    errors,
    allTags,
    folders,
    isTagMakerOpen,
    setIsTagMakerOpen,
    thumbnailDetailOpen,
    setThumbnailDetailOpen,
    isSavePending,
    hasAssetType,
    canExpandThumbnail: hasAssetType,

    // Actions
    handleClose,
    handleSave,
    handleDownload,
    createTagMutation,
    updateTagMutation,
    deleteTagMutation,
    deleteNote,
    close,
  };
}

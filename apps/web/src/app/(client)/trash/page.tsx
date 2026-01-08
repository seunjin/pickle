"use client";
import { Icon } from "@pickle/icons";
import { Button, Confirm, useDialog } from "@pickle/ui";
import { useQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { NoteList } from "@/features/note";
import { getTrashNotes } from "@/features/note/api/getTrashNotes";
import { useEmptyTrashMutation } from "@/features/note/model/useEmptyTrashMutation";

export default function TrashPage() {
  const dialog = useDialog();
  const { mutate: emptyTrash, isPending } = useEmptyTrashMutation();

  const { data: trashNotes = [] } = useQuery({
    queryKey: ["notes", "trash"],
    queryFn: () => getTrashNotes(),
  });

  const handleEmptyTrash = () => {
    dialog.open(() => (
      <Confirm
        title="휴지통 비우기"
        content={`휴지통의 모든 노트가 영구적으로 삭제됩니다.\n계속하시겠습니까?`}
        confirmButtonText="휴지통 비우기"
        isPending={isPending}
        onConfirm={() => {
          emptyTrash();
        }}
      />
    ));
  };

  return (
    <div className="h-full p-10">
      {trashNotes.length > 0 && (
        <div className="pb-7.5">
          <Button variant="secondary_line" onClick={handleEmptyTrash}>
            휴지통 비우기 <Icon name="trash_16" />
          </Button>
        </div>
      )}

      <Suspense
        fallback={
          <div className="flex items-center justify-center py-16 text-base-muted">
            Loading notes...
          </div>
        }
      >
        <NoteList
          notes={trashNotes}
          readonly
          emptyMessage="휴지통이 비어 있습니다"
          emptyDescription="삭제된 노트가 여기에 표시됩니다."
        />
      </Suspense>
    </div>
  );
}

"use client";

import { Button, Confirm, useDialog } from "@pickle/ui";

interface NoteDetailActionsProps {
  noteId: string;
  isSavePending: boolean;
  isValid: boolean;
  onSave: () => void;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
  readOnly?: boolean;
}

export function NoteDetailActions({
  noteId,
  isSavePending,
  isValid,
  onSave,
  onDelete,
  onClose,
  readOnly,
}: NoteDetailActionsProps) {
  const dialog = useDialog();

  if (readOnly) return null;

  return (
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
                  await onDelete(noteId);
                  onClose();
                } catch (_error) {
                  // Error handled in mutation
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
        onClick={onSave}
      >
        저장하기
      </Button>
    </div>
  );
}

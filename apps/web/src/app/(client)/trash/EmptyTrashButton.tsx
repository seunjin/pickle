"use client";
import { Icon } from "@pickle/icons";
import { Button, Confirm, useDialog } from "@pickle/ui";
import { useEmptyTrashMutation } from "@/features/note/model/useEmptyTrashMutation";

export default function EmptyTrashButton() {
  const dialog = useDialog();
  const { mutate: emptyTrash, isPending } = useEmptyTrashMutation();
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
    <Button variant="secondary_line" onClick={handleEmptyTrash}>
      휴지통 비우기 <Icon name="trash_16" />
    </Button>
  );
}

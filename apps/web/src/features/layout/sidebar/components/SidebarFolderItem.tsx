import { Icon } from "@pickle/icons";
import {
  ActionButton,
  Confirm,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  useDialog,
  useToast,
} from "@pickle/ui";
import { cn } from "@pickle/ui/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  useDeleteFolder,
  useUpdateFolder,
} from "@/features/folder/model/folderMutations";
import { useFolderNameInput } from "../hooks/useFolderNameInput";
import { SidebarItemBase, type SidebarItemBaseProps } from "./SidebarItemBase";

interface SidebarFolderItemProps extends Omit<SidebarItemBaseProps, "icon"> {
  folderId: string;
}
/**
 * 폴더 리스트의 개별 아이템 컴포넌트
 * 이름 변경, 삭제 등의 관리 기능을 포함합니다.
 */
export const SidebarFolderItem = (props: SidebarFolderItemProps) => {
  const { folderId, active, forceFocus, ...baseProps } = props;
  const [open, setOpen] = useState<boolean>(false);
  const router = useRouter();
  const dialog = useDialog();
  const toast = useToast();

  const updateFolderMutation = useUpdateFolder();
  const deleteFolderMutation = useDeleteFolder();
  const {
    name: changeFolderName,
    handleChange,
    maxLength,
  } = useFolderNameInput({ initialValue: props.label });

  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const preventFocusRestore = useRef(false);

  // 편집 모드 진입 시 자동 포커스
  useEffect(() => {
    if (isEditing) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [isEditing]);

  const handleSaveAndClose = () => {
    if (changeFolderName.trim() && changeFolderName !== props.label) {
      updateFolderMutation.mutate({
        folderId,
        input: { name: changeFolderName.trim() },
      });
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    dialog.open(() => (
      <Confirm
        title="폴더 삭제"
        content={`폴더 안의 모든 데이터는 휴지통으로\n이동됩니다.`}
        isPending={deleteFolderMutation.isPending}
        confirmButtonText="삭제"
        onConfirm={async () => {
          try {
            await deleteFolderMutation.mutateAsync(folderId);
            toast.success({
              title: "폴더가 휴지통으로 이동되었습니다.",
            });
            dialog.close();
            // 현재 보고 있는 폴더가 삭제된 폴더인 경우 Inbox(dashboard)로 이동
            if (window.location.search.includes(`folderId=${folderId}`)) {
              router.push("/dashboard");
            }
          } catch (error) {
            console.error("Failed to delete folder:", error);
            toast.error({
              title: "폴더 삭제에 실패했습니다.",
            });
            dialog.close();
          }
        }}
      />
    ));
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSaveAndClose();
    }
    if (e.key === "Escape") {
      setIsEditing(false);
    }
  };

  return (
    <div className="group/folder relative">
      <SidebarItemBase
        icon={
          <Icon
            name={"folder_16"}
            className={cn(
              "w-5 shrink-0 transition-colors group-hover:text-neutral-300",
              active && "text-base-primary group-hover:text-base-primary",
              !active && forceFocus && "text-neutral-300",
              active &&
                forceFocus &&
                "text-base-primary group-hover:text-base-primary",
            )}
          />
        }
        forceFocus={open}
        {...baseProps}
        rightSection={
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
              <ActionButton
                variant={"subAction"}
                icon="ellipsis_16"
                forceFocus={open}
                className={cn(
                  "opacity-0 transition-opacity group-hover/folder:opacity-100",
                  open && "opacity-100",
                )}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              side="bottom"
              sideOffset={10}
              className="w-fit"
              onCloseAutoFocus={(e) => {
                if (preventFocusRestore.current) {
                  e.preventDefault();
                  preventFocusRestore.current = false;
                }
              }}
            >
              <DropdownMenuItem asChild>
                <button
                  type="button"
                  className="w-full cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    preventFocusRestore.current = true;
                    setIsEditing(true);
                  }}
                >
                  <Icon name="edit_16" /> 이름 바꾸기
                </button>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <button
                  type="button"
                  className="w-full cursor-pointer text-base-danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                >
                  <Icon name="trash_16" />
                  폴더 삭제
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />
      {isEditing && (
        <>
          {/* 외부 클릭 감지를 위한 투명 레이어 */}
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default bg-transparent"
            onClick={(e) => {
              e.stopPropagation();
              handleSaveAndClose();
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") handleSaveAndClose();
            }}
            aria-label="닫기"
          />
          <div className="absolute top-[50%] left-[50%] z-50 flex h-[46px] w-full translate-x-[-50%] translate-y-[-50%] items-center gap-2 rounded-lg bg-neutral-850 px-3 shadow-standard outline outline-base-border-light">
            <Icon name="folder_20" className="shrink-0 text-neutral-400" />
            <Input
              ref={inputRef}
              size={"mini"}
              type="text"
              value={changeFolderName}
              placeholder="폴더명은 30자로 제한됩니다."
              maxLength={maxLength}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onBlur={handleSaveAndClose}
            />
          </div>
        </>
      )}
    </div>
  );
};

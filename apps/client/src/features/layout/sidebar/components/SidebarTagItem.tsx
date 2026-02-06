import { Icon, type IconName } from "@pickle/icons";
import {
  ActionButton,
  Confirm,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  TAG_VARIANTS,
  type TagColor,
  TagColorPalette,
  useDialog,
  useToast,
} from "@pickle/ui";
import { cn } from "@pickle/ui/lib/utils";
import { useEffect, useRef, useState } from "react";
import { useDeleteTag, useUpdateTag } from "@/features/tag/model/tagMutations";
import { logger } from "@/shared/lib/logger";
import { useTagNameInput } from "../hooks/useTagNameInput";
import { SidebarItemBase, type SidebarItemBaseProps } from "./SidebarItemBase";

interface SidebarTagItemProps extends SidebarItemBaseProps {
  icon: IconName;
  tagId: string;
  tagStyle: keyof typeof TAG_VARIANTS;
}
/**
 * 태그 리스트의 개별 아이템 컴포넌트
 * 이름 변경, 삭제 등의 관리 기능을 포함합니다.
 */
export const SidebarTagItem = (props: SidebarTagItemProps) => {
  const { tagId, icon, tagStyle, label, active, ...baseProps } = props;
  const [open, setOpen] = useState<boolean>(false);
  const dialog = useDialog();
  const toast = useToast();

  const updateTagMutation = useUpdateTag();
  const deleteTagMutation = useDeleteTag();

  const {
    name: changeTagName,
    handleChange,
    maxLength,
  } = useTagNameInput({ initialValue: label });

  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const preventFocusRestore = useRef(false);

  const [tempColor, setTempColor] = useState<TagColor>(tagStyle as TagColor);

  const style = TAG_VARIANTS[tempColor as keyof typeof TAG_VARIANTS];
  const forceFocus = open;

  // 서버 데이터와 로컬 상태 동기화
  useEffect(() => {
    setTempColor(tagStyle as TagColor);
  }, [tagStyle]);

  // 편집 모드 진입 시 자동 포커스
  useEffect(() => {
    if (isEditing) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [isEditing]);

  const handleSaveAndClose = () => {
    if (changeTagName.trim() && changeTagName !== label) {
      updateTagMutation.mutate({
        tagId,
        input: { name: changeTagName.trim() },
      });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSaveAndClose();
    }
    if (e.key === "Escape") {
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    dialog.open(() => (
      <Confirm
        title="태그 삭제"
        content={`태그를 삭제하시겠습니까?\n노트에서 이 태그가 모두 제거됩니다.`}
        isPending={deleteTagMutation.isPending}
        confirmButtonText="삭제"
        onConfirm={async () => {
          try {
            await deleteTagMutation.mutateAsync(tagId);
            toast.success({
              title: "태그가 삭제되었습니다.",
            });
            dialog.close();
          } catch (error) {
            logger.error("Failed to delete tag", { tagId, error });
            toast.error({
              title: "태그 삭제에 실패했습니다.",
            });
            dialog.close();
          }
        }}
      />
    ));
    setOpen(false);
  };

  return (
    <div className="group/tag relative">
      <SidebarItemBase
        icon={<Icon name={icon} className={cn(style.baseColor, "shrink-0")} />}
        forceFocus={forceFocus}
        label={label}
        active={active}
        {...baseProps}
        rightSection={
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
              <ActionButton
                variant={"subAction"}
                icon="ellipsis_16"
                forceFocus={open}
                className={cn(
                  "opacity-0 transition-opacity group-hover/tag:opacity-100",
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
              <TagColorPalette
                color={tempColor}
                onColorChange={setTempColor}
                onOpenChange={(isOpen) => {
                  if (!isOpen && tempColor !== tagStyle) {
                    updateTagMutation.mutate({
                      tagId,
                      input: { style: tempColor },
                    });
                  }
                }}
              />

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
                  태그 삭제
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
              if (e.key === "Escape") setIsEditing(false);
            }}
            aria-label="닫기"
          />
          <div className="absolute top-[50%] left-[50%] z-50 flex h-[46px] w-full translate-x-[-50%] translate-y-[-50%] items-center gap-2 rounded-lg bg-neutral-850 px-3 shadow-standard outline outline-base-border-light">
            <Icon name={icon} className={cn(style.baseColor, "shrink-0")} />
            <Input
              ref={inputRef}
              size={"mini"}
              type="text"
              value={changeTagName}
              placeholder="태그명은 30자로 제한됩니다."
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

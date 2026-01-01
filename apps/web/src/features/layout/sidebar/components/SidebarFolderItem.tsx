import { Icon } from "@pickle/icons";
import {
  ActionButton,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
} from "@pickle/ui";
import { useEffect, useRef, useState } from "react";
import { SidebarItemBase, type SidebarItemBaseProps } from "./SidebarItemBase";

/**
 * NOTES 섹션 등을 위한 확장 기능(폴더 이름 변경, 편집 등)이 포함된 메뉴 아이템
 */
export const SidebarFolderItem = (props: SidebarItemBaseProps) => {
  const [open, setOpen] = useState<boolean>(false);
  /* --- [Rename Logic] --- */
  const [changeFolderName, setChangeFolderName] = useState<string>(props.label); // 초기값 설정 수정 필요할 수 있음
  const [isEditing, setIsEditing] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
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
    console.log("Renaming (Optimistic) to:", changeFolderName); // TODO: API Call
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

  return (
    <div className="relative">
      <SidebarItemBase
        forceFocus={open}
        {...props}
        rightSection={
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
              <ActionButton
                variant={"subAction"}
                icon="ellipsis_16"
                forceFocus={open}
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
                  <Icon name="edit_16" /> 이름 변경
                </button>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <button type="button" className="w-full cursor-pointer">
                  <Icon name="trash_16" />
                  폴더 삭제
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      {/* 이름바꾸기 모달 (Overlay + Popup) */}
      {isEditing && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-50 cursor-default bg-transparent"
            tabIndex={-1}
            aria-label="Close rename popup"
            onClick={(e) => {
              e.stopPropagation();
              handleSaveAndClose();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "Escape") {
                e.stopPropagation();
                handleSaveAndClose();
              }
            }}
          />

          <div
            ref={popupRef}
            className="absolute top-[50%] left-[50%] z-50 flex h-[46px] w-full translate-x-[-50%] translate-y-[-50%] items-center gap-2 rounded-lg border border-base-border-light bg-neutral-850 px-3 shadow-md"
          >
            <Icon name="folder_20" />
            <Input
              ref={inputRef}
              autoFocus
              className="flex-1"
              type="text"
              size={"mini"}
              value={changeFolderName}
              placeholder="새 이름 입력"
              onChange={(e) => setChangeFolderName(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        </>
      )}
    </div>
  );
};

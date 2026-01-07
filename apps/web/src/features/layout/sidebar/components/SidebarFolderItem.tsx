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
 * 폴더 리스트의 개별 아이템 컴포넌트
 * 이름 변경, 삭제 등의 관리 기능을 포함합니다.
 */
export const SidebarFolderItem = (props: SidebarItemBaseProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const [changeFolderName, setChangeFolderName] = useState<string>(props.label);
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
    <div className="group/folder relative">
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
                  <Icon name="edit_16" /> 이름 변경
                </button>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <button
                  type="button"
                  className="w-full cursor-pointer text-base-danger"
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
              autoFocus
              size={"mini"}
              // className="flex-1 border-none bg-transparent p-0 text-sm focus-visible:ring-0"
              type="text"
              value={changeFolderName}
              placeholder="폴더 이름"
              onChange={(e) => setChangeFolderName(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSaveAndClose}
            />
          </div>
        </>
      )}
    </div>
  );
};

// cn 사용을 위한 임포트 추가 (필요시)
import { cn } from "@pickle/ui/lib/utils";

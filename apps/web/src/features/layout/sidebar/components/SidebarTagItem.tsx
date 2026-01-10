import { Icon, type IconName } from "@pickle/icons";
import {
  ActionButton,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  TAG_VARIANTS,
} from "@pickle/ui";
import { cn } from "@pickle/ui/lib/utils";
import { useState } from "react";
import { SidebarItemBase, type SidebarItemBaseProps } from "./SidebarItemBase";

interface SidebarTagItemProps extends SidebarItemBaseProps {
  icon: IconName;
  tagId: string;
  iconClassName?: string;
  tagStyle: keyof typeof TAG_VARIANTS;
}
/**
 * 태그 리스트의 개별 아이템 컴포넌트
 * 이름 변경, 삭제 등의 관리 기능을 포함합니다.
 */
export const SidebarTagItem = (props: SidebarTagItemProps) => {
  const { tagId, icon, iconClassName, tagStyle, ...baseProps } = props;
  const [open, setOpen] = useState<boolean>(false);
  const style = TAG_VARIANTS[tagStyle as keyof typeof TAG_VARIANTS];
  const forceFocus = open;
  return (
    <div className="group/tag relative">
      <SidebarItemBase
        icon={<Icon name={icon} className={cn(style.baseColor, "shrink-0")} />}
        forceFocus={forceFocus}
        {...baseProps}
        rightSection={
          <DropdownMenu open={forceFocus} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
              <ActionButton
                variant={"subAction"}
                icon="ellipsis_16"
                forceFocus={forceFocus}
                className={cn(
                  "opacity-0 transition-opacity group-hover/tag:opacity-100",
                  forceFocus && "opacity-100",
                )}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              side="bottom"
              sideOffset={10}
              className="w-fit"
            >
              <DropdownMenuItem asChild>
                <button
                  type="button"
                  className="w-full cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
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
    </div>
  );
};

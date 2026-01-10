import { Icon, type IconName } from "@pickle/icons";
import { cn } from "@pickle/ui/lib/utils";
import { SidebarItemBase, type SidebarItemBaseProps } from "./SidebarItemBase";

export type { SidebarItemBaseProps };

/**
 * 기본적인 일반 네비게이션 아이템 (Inbox, 즐겨찾기 등)
 */
export const SidebarNavItem = ({
  badge,
  icon,
  ...props
}: Omit<SidebarItemBaseProps, "icon"> & { badge?: number; icon: IconName }) => {
  const badgeElement =
    badge !== undefined && badge > 0 ? (
      <span
        className={cn(
          "flex h-5 min-w-5 cursor-default items-center justify-center rounded-sm bg-green-100/16 px-1.5 font-medium text-xs",
          // hover 스타일 추가
          props.active ? "text-base-primary" : "text-base-muted-foreground",
        )}
      >
        {badge}
      </span>
    ) : undefined;

  const { active, forceFocus } = props;

  return (
    <SidebarItemBase
      {...props}
      icon={
        <Icon
          name={icon}
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
      rightSection={badgeElement}
    />
  );
};

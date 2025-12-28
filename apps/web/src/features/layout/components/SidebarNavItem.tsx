import { cn } from "@pickle/ui/lib/utils";
import { SidebarItemBase, type SidebarItemBaseProps } from "./SidebarItemBase";

export type { SidebarItemBaseProps };

/**
 * 기본적인 일반 네비게이션 아이템 (Inbox, 즐겨찾기 등)
 */
export const SidebarNavItem = ({
  badge,
  ...props
}: SidebarItemBaseProps & { badge?: number }) => {
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

  return <SidebarItemBase {...props} rightSection={badgeElement} />;
};

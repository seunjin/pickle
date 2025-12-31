import { Icon, type IconName } from "@pickle/icons";
import { cn } from "@pickle/ui/lib/utils";
import Link from "next/link";
import type React from "react";

export interface SidebarItemBaseProps {
  href: string;
  icon: IconName;
  label: string;
  active?: boolean;
  rightSection?: React.ReactNode;
}

/**
 * 모든 사이드바 아이템의 기본형(Base) 레이아웃을 담당합니다.
 */
export const SidebarItemBase = ({
  href,
  icon,
  label,
  active,
  rightSection,
}: SidebarItemBaseProps) => {
  return (
    <div
      className={cn(
        "group flex items-center rounded-lg transition-[background-color] hover:bg-base-foreground-background",
        active &&
          "bg-base-primary-active-background hover:bg-base-primary-active-background",
      )}
    >
      <Link
        href={href}
        className={cn(
          "flex min-w-0 flex-1 items-center gap-3 px-3 py-2 text-sm transition-colors",
        )}
      >
        <div className={cn("flex min-w-0 flex-1 items-center gap-2")}>
          <Icon
            name={icon}
            className={cn(
              "w-5 shrink-0 transition-colors",
              active && "text-base-primary group-hover:text-base-primary",
              "group-hover:text-neutral-300",
            )}
          />
          <span
            className={cn(
              "truncate text-[15px] text-base-muted-foreground leading-[15px] transition-colors group-hover:text-base-foreground",
              active && "text-base-primary group-hover:text-base-primary",
            )}
          >
            {label}
          </span>
        </div>
      </Link>

      {/* 우측 섹션 (드롭다운 등 대화형 요소) */}
      {rightSection && (
        <div className="flex shrink-0 items-center justify-center pr-2">
          {rightSection}
        </div>
      )}
    </div>
  );
};

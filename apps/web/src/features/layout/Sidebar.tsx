"use client";
import { Icon, type IconName } from "@pickle/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@pickle/ui";

import { cn } from "@pickle/ui/lib/utils";
import Link from "next/link";
import { useSessionContext } from "../auth/model/SessionContext";

export const Sidebar = () => {
  const { workspace, appUser, isLoading } = useSessionContext();

  if (isLoading) {
    return (
      <nav className="flex h-full flex-col gap-4 p-4">
        <div className="h-8 w-3/4 animate-pulse rounded bg-neutral-800" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-neutral-800" />
      </nav>
    );
  }

  return (
    <nav className="flex h-full flex-col bg-neutral-900 px-6 py-[30px]">
      {/* 상단: 로고 영역 */}
      <div className="flex items-center justify-between pb-10">
        {/* 로고 placeholder */}
        <div className="flex items-center gap-1.5">
          <div className="h-6 w-6 rounded bg-base-primary" />
          <span className="font-bold text-lg text-neutral-200">pickle</span>
        </div>
        {/* 사이드바 토글 버튼 */}
        <button
          type="button"
          className="text-base-muted transition-colors hover:text-neutral-300"
        >
          <Icon name="layout" size={20} />
        </button>
      </div>

      {/* 메뉴 섹션 */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        {/* 주요 메뉴 */}
        <div>
          <ul className="flex flex-col gap-1 pb-[30px]">
            <MenuItem
              href="/dashboard"
              icon="archive"
              label="Inbox"
              badge={3}
              active
            />
            <MenuItem
              href="/dashboard"
              icon="archive"
              label="Inbox"
              badge={3}
            />
            <MenuItem href="/favorites" icon="bookmark" label="즐겨찾기" />
            <MenuItem href="/tags" icon="tag" label="모든 태그" />
          </ul>

          {/* NOTES 섹션 */}
          <div className="pb-40">
            <div className="mb-2 flex items-center justify-between px-2">
              <span className="font-semibold text-[13px] text-neutral-650 leading-[13px] tracking-wider">
                NOTES
              </span>
            </div>

            <ul className="flex flex-col gap-1">
              <NoteMenuItem
                href="/dashboard"
                icon="note_empty"
                label={workspace?.name ?? "Workspace"}
              />
              {/* 새 노트 버튼 */}
              <li className="px-3 py-2">
                <button
                  type="button"
                  className="flex w-full cursor-pointer items-center gap-2 text-base-muted text-sm transition-colors hover:text-base-muted-foreground active:text-base-primary"
                >
                  <Icon name="plus" size={20} />
                  <span>새 노트 생성하기</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* 휴지통 */}
        <div className="mt-auto">
          <MenuItem href="/trash" icon="trash" label="휴지통" />
        </div>
      </div>

      {/* 하단: 프로필 */}
      <div className="mt-[24px] border-base-border border-t">
        {/* 사용자 프로필 */}
        <div className="flex justify-between pt-[24px]">
          <div className="flex items-center gap-3">
            {appUser?.avatar_url ? (
              <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-base-border">
                <img
                  src={appUser.avatar_url}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-base-primary text-center font-bold text-neutral-900">
                {appUser?.full_name?.[0] ?? "U"}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-base-foreground text-sm">
                {appUser?.full_name || "User"}
              </p>
              <p className="truncate text-base-muted text-xs">
                {appUser?.email}
              </p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

// --- 하위 컴포넌트 (Composition) ---

interface MenuItemContainerProps {
  href: string;
  icon: IconName;
  label: string;
  active?: boolean;
  rightSection?: React.ReactNode;
}

/**
 * 모든 메뉴 아이템의 공통 레이아웃을 담당합니다.
 */
const MenuItemContainer = ({
  href,
  icon,
  label,
  active,
  rightSection,
}: MenuItemContainerProps) => {
  return (
    <li
      className={cn(
        "group flex items-center rounded-lg transition-[background-color] hover:bg-neutral-850",
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
            size={20}
            className={cn(
              "w-5 shrink-0 text-base-muted",
              active && "text-base-primary group-hover:text-base-primary",
            )}
          />
          <span
            className={cn(
              "truncate text-[15px] text-base-muted-foreground leading-[15px] transition-colors group-hover:text-base-muted-foreground",
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
    </li>
  );
};

/**
 * 기본적인 일반 메뉴 아이템 (Inbox, 즐겨찾기 등)
 */
const MenuItem = ({
  badge,
  ...props
}: MenuItemContainerProps & { badge?: number }) => {
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

  return <MenuItemContainer {...props} rightSection={badgeElement} />;
};

/**
 * NOTES 섹션 등을 위한 확장 기능(편집 등)이 포함된 메뉴 아이템
 */
const NoteMenuItem = (props: MenuItemContainerProps) => {
  return (
    <MenuItemContainer
      {...props}
      rightSection={
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="cursor-pointer items-center rounded-md p-0.5 text-base-muted opacity-0 transition-[background-color,color,opacity] hover:bg-green-100/16 hover:text-base-foreground group-focus-within:opacity-100 group-hover:flex group-hover:opacity-100"
            >
              <Icon name="ellipsis" size={16} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            side="right"
            sideOffset={-20}
            className="w-40"
          >
            <DropdownMenuLabel>NOTES</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                // TODO: 상위에서 주입받은이름 변경 모달 실행 로직
                console.log("이름 변경 클릭");
              }}
            >
              이름 변경
            </DropdownMenuItem>

            <DropdownMenuItem variant="destructive">
              <Icon name="trash" size={20} /> 삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      }
    />
  );
};

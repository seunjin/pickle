"use client";

import { Button, Icon, type IconName } from "@pickle/ui";
import Link from "next/link";
import { useSessionContext } from "../auth/model/SessionContext";
import { SignOutButton } from "../auth/ui/SignOutButton";

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
    <nav className="flex h-full flex-col px-6 py-[30px]">
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
          className="cursor-pointer text-base-muted transition-colors hover:text-neutral-300 active:text-base-primary"
        >
          <Icon name="layout" size={20} />
        </button>
      </div>

      {/* 메뉴 섹션 */}
      <div className="flex-1 overflow-y-auto">
        {/* 주요 메뉴 */}
        <ul className="flex flex-col gap-1">
          <MenuItem
            href="/dashboard"
            icon="archive"
            label="Inbox"
            badge={3}
            active
          />
          <MenuItem href="/favorites" icon="bookmark" label="즐겨찾기" />
          <MenuItem href="/tags" icon="tag" label="모든 태그" />
        </ul>

        {/* NOTES 섹션 */}
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between px-2">
            <span className="font-medium text-base-muted text-xs uppercase tracking-wider">
              Notes
            </span>
            {/* 추가 버튼 placeholder */}
            <button
              type="button"
              className="flex h-5 w-5 items-center justify-center rounded text-base-muted hover:bg-base-foreground-background hover:text-base-foreground"
            >
              +
            </button>
          </div>

          <ul className="flex flex-col gap-1">
            <MenuItem
              href="/dashboard"
              icon="note_empty"
              label={workspace?.name ?? "Workspace"}
            />
          </ul>
        </div>

        {/* 새 노트 버튼 */}
        <button
          type="button"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-base-border border-dashed py-2 text-base-muted text-sm transition-colors hover:border-base-primary hover:text-base-primary"
        >
          <span>+</span>
          <span>새 노트 생성하기</span>
        </button>
      </div>

      {/* 하단: 휴지통 + 프로필 */}
      <div className="border-base-border border-t p-3">
        {/* 휴지통 */}
        <MenuItem href="/trash" icon="trash" label="휴지통" />

        {/* 사용자 프로필 */}
        <div className="mt-3 flex items-center gap-3 rounded-lg p-2 hover:bg-base-foreground-background">
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
            <p className="truncate text-base-muted text-xs">{appUser?.email}</p>
          </div>
        </div>

        <Icon name="layout" size={20} />

        {/* 로그아웃 */}
        <div className="mt-2">
          <SignOutButton />
        </div>
      </div>
    </nav>
  );
};

// 메뉴 아이템 컴포넌트
interface MenuItemProps {
  href: string;
  icon: IconName;
  label: string;
  badge?: number;
  active?: boolean;
}

const MenuItem = ({ href, icon, label, badge, active }: MenuItemProps) => {
  return (
    <li>
      <Link
        href={href}
        className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
          active
            ? "bg-base-primary-active-background text-base-primary"
            : "text-base-muted-foreground hover:bg-base-foreground-background hover:text-base-foreground"
        }`}
      >
        {/* 아이콘 placeholder */}
        <div className="flex items-center gap-2">
          <Icon name={icon} size={20} />
          <span className="text-[15px]">{label}</span>
        </div>
        {badge !== undefined && badge > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-base-primary px-1.5 font-medium text-neutral-900 text-xs">
            {badge}
          </span>
        )}
      </Link>
    </li>
  );
};

"use client";

import { Icon } from "@pickle/icons";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  InputWithAddon,
} from "@pickle/ui";
import { cn } from "@pickle/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useSignOut, useUser } from "@/features/auth";
import { folderQueries } from "@/features/folder";
import { tagQueries } from "@/features/tag/model/tagQueries";
import { StorageUsage } from "@/features/workspace/ui/StorageUsage";
import { createClient } from "@/shared/lib/supabase/client";

const ROUTE_CONFIG: Record<string, { title: string }> = {
  "/dashboard": {
    title: "Inbox",
  },
  "/bookmarks": {
    title: "북마크",
  },
  "/trash": {
    title: "휴지통",
  },
  "/settings": {
    title: "설정",
  },
};

export function AppHeader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { appUser } = useUser();
  const { signOut } = useSignOut();
  const client = createClient();
  const [avatarPanelOpen, setAvatarPanelOpen] = useState<boolean>(false);

  const folderId = searchParams.get("folderId");
  const tagId = searchParams.get("tagId");

  // 데이터 조회 (캐시 활용)
  const { data: folders = [] } = useQuery(folderQueries.list(client));
  const { data: tags = [] } = useQuery(tagQueries.list());

  // 현재 컨텍스트에 따른 타이틀 및 아이콘 결정
  let displayTitle =
    ROUTE_CONFIG[pathname]?.title || ROUTE_CONFIG["/dashboard"].title;

  let category: "FOLDERS" | "TAGS" | null = null;

  if (pathname === "/dashboard") {
    if (tagId) {
      const tag = tags.find((t) => t.id === tagId);
      displayTitle = tag ? tag.name : "Tag";
      category = "TAGS";
    } else if (folderId) {
      const folder = folders.find((f) => f.id === folderId);
      displayTitle = folder ? folder.name : "Folder";
      category = "FOLDERS";
    }
  }

  const avatar_url = appUser?.avatar_url;

  return (
    <header className="flex h-(--web-header-height) shrink-0 items-center justify-between gap-8 border-base-border border-b bg-base-background px-10">
      <div
        className={cn(
          "grid",
          category ? "grid-cols-[1fr_auto]" : "grid-cols-[1fr]",
          "items-center gap-1",
        )}
      >
        <h1 className="truncate font-bold text-[20px] text-base-foreground leading-none">
          {displayTitle}
        </h1>

        {category && (
          <div className="shrink-0 font-medium text-[13px] text-neutral-650">
            <span className="inline-flex size-4 items-center justify-center">
              /
            </span>
            <span>{category}</span>
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-6">
        <InputWithAddon
          containerClassName="group w-80"
          placeholder="검색어를 입력해 주세요."
          startAddon={
            <Icon
              name="search_20"
              className="transition-colors group-focus-within:text-base-primary"
            />
          }
        />

        {avatar_url && (
          <DropdownMenu
            open={avatarPanelOpen}
            onOpenChange={setAvatarPanelOpen}
          >
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="group/avatar inline-flex shrink-0 items-center gap-0.5 overflow-hidden outline-none"
              >
                <img
                  src={avatar_url}
                  alt="Avatar"
                  className="size-8 rounded-full border border-base-border object-cover"
                />
                <Icon
                  name={avatarPanelOpen ? "arrow_up_16" : "arrow_down_16"}
                  className={cn(
                    "transiton-color group-hover/avatar:text-neutral-300",
                    avatarPanelOpen && "text-neutral-300",
                  )}
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="min-w-[260px] px-2 pt-5 pb-3"
            >
              {/* 프로필 */}
              <div className="px-3 pb-4">
                <div className="flex items-center gap-3 pb-5">
                  <img
                    src={avatar_url}
                    alt="Avatar"
                    className="size-10 rounded-full border border-base-border object-cover"
                  />
                  <div className="flex flex-col justify-center gap-1">
                    {/* 유저 이름 */}
                    <div className="flex items-center gap-0.5">
                      <span className="font-medium text-[13px] text-neutral-200 leading-none">
                        {appUser?.full_name}
                      </span>
                      <Icon
                        name="arrow_right_12"
                        className="text-neutral-300"
                      />
                    </div>
                    {/* 유저 이메일 */}
                    <span className="text-[13px] text-muted-foreground leading-none">
                      {appUser?.email}
                    </span>
                  </div>
                </div>
                <Button className="w-full" size={"h32"}>
                  플랜 업그레이드
                </Button>
              </div>
              <DropdownMenuSeparator className="-mx-2" />
              {/* 스토리지 사용량 */}
              <div className="pt-5 pb-4">
                <div className="flex flex-col gap-4 px-3">
                  <span className="font-medium text-[13px] text-neutral-200 leading-none">
                    스토리지 사용량
                  </span>
                  <div className="pb-3">
                    <StorageUsage />
                  </div>
                </div>
                <div className="rounded-lg bg-neutral-900 p-3 text-[11px] text-neutral-500">
                  <dl className="flex justify-between">
                    <dt className="">이미지</dt>
                    <dd>23.8MB</dd>
                  </dl>
                  <dl className="flex justify-between">
                    <dt>북마크</dt>
                    <dd>23.8MB</dd>
                  </dl>
                  <dl className="flex justify-between">
                    <dt>텍스트</dt>
                    <dd>23.8MB</dd>
                  </dl>
                </div>
              </div>
              <DropdownMenuSeparator className="-mx-2" />
              <div className="flex flex-col gap-[5px] pt-2">
                <DropdownMenuItem asChild>
                  <button
                    type="button"
                    onClick={signOut}
                    className="flex w-full items-center gap-2"
                  >
                    <Icon name="logout_16" /> 피클약관
                  </button>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <button
                    type="button"
                    onClick={signOut}
                    className="flex w-full items-center gap-2"
                  >
                    <Icon name="logout_16" />
                    로그아웃
                  </button>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}

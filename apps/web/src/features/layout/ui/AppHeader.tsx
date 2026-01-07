"use client";

import { Icon, type IconName } from "@pickle/icons";
import { InputWithAddon } from "@pickle/ui";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useSearchParams } from "next/navigation";
import { useUser } from "@/features/auth/model/useUser";
import { folderQueries } from "@/features/folder";
import { tagQueries } from "@/features/tag/model/tagQueries";
import { createClient } from "@/shared/lib/supabase/client";

const ROUTE_CONFIG: Record<
  string,
  { title: string; placeholder: string; icon: IconName }
> = {
  "/dashboard": {
    title: "Inbox",
    placeholder: "검색어를 입력해 주세요.",
    icon: "archive_20",
  },
  "/bookmarks": {
    title: "Bookmarks",
    placeholder: "북마크 검색...",
    icon: "bookmark_20",
  },
  "/trash": {
    title: "Trash",
    placeholder: "휴지통 검색...",
    icon: "trash_20",
  },
  "/settings": {
    title: "Settings",
    placeholder: "설정 검색...",
    icon: "setting_20",
  },
};

export function AppHeader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { appUser } = useUser();
  const client = createClient();

  const folderId = searchParams.get("folderId");
  const tagId = searchParams.get("tagId");

  // 데이터 조회 (캐시 활용)
  const { data: folders = [] } = useQuery(folderQueries.list(client));
  const { data: tags = [] } = useQuery(tagQueries.list());

  // 현재 컨텍스트에 따른 타이틀 및 아이콘 결정
  let displayTitle =
    ROUTE_CONFIG[pathname]?.title || ROUTE_CONFIG["/dashboard"].title;
  let displayIcon =
    ROUTE_CONFIG[pathname]?.icon || ROUTE_CONFIG["/dashboard"].icon;
  const placeholder =
    ROUTE_CONFIG[pathname]?.placeholder ||
    ROUTE_CONFIG["/dashboard"].placeholder;

  if (pathname === "/dashboard") {
    if (tagId) {
      const tag = tags.find((t) => t.id === tagId);
      displayTitle = tag ? tag.name : "Tag";
      displayIcon = "tag_20";
    } else if (folderId) {
      const folder = folders.find((f) => f.id === folderId);
      displayTitle = folder ? folder.name : "Folder";
      displayIcon = "folder_20";
    }
  }

  const avatar_url = appUser?.avatar_url;

  return (
    <header className="flex h-[60px] shrink-0 items-center justify-between gap-2 border-base-border border-b bg-base-background px-10">
      <div className="grid grid-cols-[auto_1fr] items-center gap-1">
        <Icon name={displayIcon} className="shrink-0 text-base-foreground" />
        <h1 className="truncate font-bold text-[20px] text-base-foreground leading-none">
          {displayTitle}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <InputWithAddon
          containerClassName="group w-90"
          placeholder={placeholder}
          startAddon={
            <Icon
              name="search_20"
              className="transition-colors group-focus-within:text-base-primary"
            />
          }
        />

        {avatar_url && (
          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-base-border">
            <img
              src={avatar_url}
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          </div>
        )}
      </div>
    </header>
  );
}

"use client";

import { Icon, type IconName } from "@pickle/icons";
import { InputWithAddon } from "@pickle/ui";
import { cn } from "@pickle/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useSearchParams } from "next/navigation";
import { useUser } from "@/features/auth/model/useUser";
import { folderQueries } from "@/features/folder";
import { tagQueries } from "@/features/tag/model/tagQueries";
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
  const client = createClient();

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
    <header className="flex h-[60px] shrink-0 items-center justify-between gap-8 border-base-border border-b bg-base-background px-10">
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

      <div className="flex w-100 shrink-0 items-center gap-3">
        <InputWithAddon
          containerClassName="group w-full"
          placeholder="검색어를 입력해 주세요."
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

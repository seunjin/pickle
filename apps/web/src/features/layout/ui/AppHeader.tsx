"use client";

import { Icon } from "@pickle/icons";
import { InputWithAddon } from "@pickle/ui";
import { cn } from "@pickle/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { folderQueries } from "@/features/folder";
import { tagQueries } from "@/features/tag/model/tagQueries";
import { createClient } from "@/shared/lib/supabase/client";
import { UserAvatarPanel } from "./UserAvatarPanel";

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
    title: "계정 설정",
  },
};

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const client = createClient();

  const folderId = searchParams.get("folderId");
  const tagId = searchParams.get("tagId");

  // 검색어 조회
  const searchRef = useRef<HTMLInputElement | null>(null);
  const [search, setSearch] = useState<string>("");

  // 데이터 조회 (캐시 활용)
  const { data: folders = [] } = useQuery(folderQueries.list(client));
  const { data: tags = [] } = useQuery(tagQueries.list());

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && search.trim() !== "") {
      router.push(`/search?q=${encodeURIComponent(search.trim())}`);
    }
  };

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
          ref={searchRef}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearch}
          containerClassName="group w-80 rounded-[8px]"
          placeholder="검색어를 입력해 주세요."
          startAddon={
            <Icon
              name="search_16"
              className="transition-colors group-focus-within:text-base-primary"
            />
          }
          endAddon={
            search.length > 0 && (
              <button
                type="button"
                className="group/search-delete inline-flex size-4 items-center justify-center rounded-full bg-neutral-700"
                onClick={() => {
                  setSearch("");
                  searchRef.current?.focus();
                }}
              >
                <Icon
                  name="delete_16"
                  className="size-3 text-neutral-400 transition-colors group-hover/search-delete:text-neutral-300"
                />
              </button>
            )
          }
        />

        <UserAvatarPanel />
      </div>
    </header>
  );
}

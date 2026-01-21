"use client";

import { Icon } from "@pickle/icons";
import { InputWithAddon, Spinner } from "@pickle/ui";
import { cn } from "@pickle/ui/lib/utils";
import { useIsFetching, useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { folderQueries } from "@/features/folder/model/folderQueries";
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
  "/search": {
    title: "",
  },
  "/legal": {
    title: "피클 약관",
  },
};

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const client = createClient();

  const folderId = searchParams.get("folderId");
  const tagId = searchParams.get("tagId");
  const currentQuery = searchParams.get("q");

  // 검색어 입력 상태
  const searchRef = useRef<HTMLInputElement | null>(null);
  const [search, setSearch] = useState<string>(currentQuery || "");

  // ✅ 정교한 검색 로딩 상태 관리
  // 1. 전역 검색 데이터 페칭 여부 확인
  const isFetchingSearch =
    useIsFetching({
      queryKey: ["notes", "search"],
    }) > 0;

  const [isInitialSearch, setIsInitialSearch] = useState(false);
  const prevQuery = useRef(currentQuery);

  // 2. 검색어(q) 파라미터가 실제로 변했을 때만 로딩 모드 진입
  useEffect(() => {
    if (currentQuery !== prevQuery.current) {
      setIsInitialSearch(true);
      prevQuery.current = currentQuery;
      // URL 파라미터 변화에 맞춰 입력창 텍스트 동기화 (필요시)
      setSearch(currentQuery || "");
    }
  }, [currentQuery]);

  // 3. 데이터 페칭이 끝나면 로딩 모드 해제
  useEffect(() => {
    if (!isFetchingSearch) {
      setIsInitialSearch(false);
    }
  }, [isFetchingSearch]);

  // 4. 최종 로딩 표시 조건: '새 검색어 유입' + '페칭 중' + '검색 페이지'
  const isLoading =
    isInitialSearch && isFetchingSearch && pathname === "/search";

  // 데이터 조회 (캐시 활용)
  const { data: folders = [] } = useQuery(folderQueries.list(client));
  const { data: tags = [] } = useQuery(tagQueries.list());

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && search.trim() !== "") {
      router.push(`/search?q=${encodeURIComponent(search.trim())}`);
    }
  };

  // 현재 컨텍스트에 따른 타이틀 및 아이콘 결정
  let displayTitle = ROUTE_CONFIG[pathname]?.title || "";

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
            isLoading ? (
              <Spinner className="text-base-primary" />
            ) : (
              <Icon
                name="search_16"
                className="transition-colors group-focus-within:text-base-primary"
              />
            )
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

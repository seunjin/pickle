"use client";
import { Icon } from "@pickle/icons";
import { ScrollArea, TAG_VARIANTS } from "@pickle/ui";
import { cn } from "@pickle/ui/lib/utils";
import { useSuspenseQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useSessionContext } from "@/features/auth";
import { folderQueries, useCreateFolder } from "@/features/folder";
import { noteQueries } from "@/features/note/model/noteQueries";
import { tagQueries } from "@/features/tag/model/tagQueries";
import { createClient } from "@/shared/lib/supabase/client";
import { SidebarFolderInput } from "./components/SidebarFolderInput";
import { SidebarFolderItem } from "./components/SidebarFolderItem";
import { SidebarFolderLoading } from "./components/SidebarFolderLoading";
import { SidebarNavItem } from "./components/SidebarNavItem";

export const Sidebar = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [foldersFolding, setFoldersFolding] = useState<boolean>(true);
  const [tagsFolding, setTagsFolding] = useState<boolean>(true);
  const [isCreatingFolder, setIsCreatingFolder] = useState<boolean>(false);
  const { workspace } = useSessionContext();
  const client = createClient();

  // 폴더 목록 조회
  const { data: folders } = useSuspenseQuery(folderQueries.list(client));

  // 폴더 생성 mutation
  const createFolderMutation = useCreateFolder(workspace?.id ?? "");

  // 태그 목록 조회
  const { data: tags = [] } = useSuspenseQuery(tagQueries.list());

  // Inbox 노트 목록 조회 (뱃지용)
  const { data: inboxNotes = [] } = useSuspenseQuery(
    noteQueries.list({ filter: { folderId: null } }),
  );

  const handleCreateFolder = (name: string) => {
    setIsCreatingFolder(false);

    createFolderMutation.mutate(
      { name },
      {
        onError: (error) => {
          console.error("Failed to create folder:", error);
          // TODO: Toast 에러 메시지 표시
        },
      },
    );
  };

  return (
    <nav className="flex h-full flex-col bg-neutral-900">
      {/* 상단: 로고 영역 */}
      <div className="flex items-center justify-between px-3 py-[30px] pb-10">
        {/* 로고 placeholder */}
        <img src="/pickle-with-logo.svg" alt="pickle with logo" />
      </div>

      {/* 메뉴 섹션 */}
      <ScrollArea className="">
        <div className="px-3">
          {/* 주요 메뉴 */}
          <div className="pb-[30px]">
            <div className="flex flex-col gap-1 pb-[30px]">
              {/* 인박스 */}
              <SidebarNavItem
                href="/dashboard"
                icon="archive_20"
                label="Inbox"
                badge={inboxNotes.length}
                active={
                  pathname === "/dashboard" &&
                  !searchParams.get("folderId") &&
                  !searchParams.get("tagId")
                }
              />

              {/* 북마크 */}
              <SidebarNavItem
                href="/bookmarks"
                icon="bookmark_20"
                label="북마크"
                active={pathname.includes("/bookmarks")}
              />
            </div>

            {/* FOLDERS 섹션 */}
            <div className="pb-[30px]">
              <div className="mb-1 h-9">
                <button
                  type="button"
                  onClick={() => setFoldersFolding(!foldersFolding)}
                  className="flex h-full w-full items-center justify-between px-3 text-neutral-650"
                >
                  <span className="font-semibold text-[13px] text-neutral-650 leading-none tracking-wider">
                    FOLDERS
                  </span>
                  <Icon
                    name={foldersFolding ? "arrow_up_16" : "arrow_down_16"}
                    className="text-inherit"
                  />
                </button>
              </div>

              <div className="flex min-h-[40px] flex-col gap-1">
                {/* 폴더 아이템들 */}
                {foldersFolding && (
                  <>
                    {/* 새 폴더 생성 입력창 */}
                    {isCreatingFolder && (
                      <SidebarFolderInput
                        onCreate={handleCreateFolder}
                        onCancel={() => setIsCreatingFolder(false)}
                      />
                    )}

                    {/* 생성 중인 폴더 로딩 */}
                    {createFolderMutation.isPending && <SidebarFolderLoading />}

                    <div className="flex flex-col gap-1">
                      {folders.map((folder) => (
                        <SidebarFolderItem
                          key={folder.id}
                          folderId={folder.id}
                          href={`/dashboard?folderId=${folder.id}`}
                          icon="folder_20"
                          label={folder.name}
                          active={
                            pathname === "/dashboard" &&
                            searchParams.get("folderId") === folder.id
                          }
                        />
                      ))}
                    </div>
                  </>
                )}

                {/* 새 폴더 버튼 */}
                <div className="px-3 py-2">
                  <button
                    type="button"
                    className="flex w-full cursor-pointer items-center gap-2 text-base-muted text-sm transition-colors hover:text-base-foreground"
                    onClick={() => {
                      setFoldersFolding(true);
                      setIsCreatingFolder(true);
                    }}
                  >
                    <Icon name="plus_20" className="text-color-[inherit]" />
                    <span>새 폴더 생성하기</span>
                  </button>
                </div>
              </div>
            </div>
            {/* TAGS 섹션 */}
            <div>
              <div className="h-9">
                <button
                  type="button"
                  onClick={() => setTagsFolding(!tagsFolding)}
                  className="flex h-full w-full items-center justify-between px-3 text-neutral-650"
                >
                  <span className="font-semibold text-[13px] text-neutral-650 leading-none tracking-wider">
                    TAGS
                  </span>

                  <Icon
                    name={tagsFolding ? "arrow_up_16" : "arrow_down_16"}
                    className="text-inherit"
                  />
                </button>
              </div>
              {tagsFolding && (
                <div className="flex flex-col gap-1">
                  {tags.map((tag) => {
                    const style =
                      TAG_VARIANTS[tag.style as keyof typeof TAG_VARIANTS];
                    const active =
                      pathname === "/dashboard" &&
                      searchParams.get("tagId") === tag.id;
                    return (
                      <Link
                        key={tag.id}
                        href={`/dashboard?tagId=${tag.id}`}
                        prefetch={false}
                        className={cn(
                          "group grid h-9 cursor-pointer grid-cols-[auto_1fr] items-center gap-2 rounded-sm px-3 text-muted-foreground transition-[color,background-color] hover:bg-base-foreground-background hover:text-base-foreground",
                          active &&
                            "bg-base-primary-active-background text-base-primary hover:bg-base-primary-active-background hover:text-base-primary",
                        )}
                      >
                        <Icon
                          name="tag_20"
                          className={cn(style.baseColor, "shrink-0")}
                        />
                        <p className="truncate">{tag.name}</p>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="mt-auto">
            {/* 설정 */}
            <SidebarNavItem
              href="/settings"
              icon="setting_20"
              label="설정"
              active={pathname === "/settings"}
            />
            {/* 휴지통 */}
            <SidebarNavItem
              href="/trash"
              icon="trash_20"
              label="휴지통"
              active={pathname === "/trash"}
            />
          </div>
        </div>
      </ScrollArea>
    </nav>
  );
};

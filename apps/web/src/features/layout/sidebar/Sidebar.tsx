"use client";
import { Icon } from "@pickle/icons";
import { ScrollArea, Tooltip } from "@pickle/ui";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useSessionContext } from "@/features/auth/model/SessionContext";
import { useCreateFolder } from "@/features/folder/model/folderMutations";
import { folderQueries } from "@/features/folder/model/folderQueries";
import { noteQueries } from "@/features/note/model/noteQueries";
import { tagQueries } from "@/features/tag/model/tagQueries";
import { logger } from "@/shared/lib/logger";
import { createClient } from "@/shared/lib/supabase/client";
import { SidebarFolderInput } from "./components/SidebarFolderInput";
import { SidebarFolderItem } from "./components/SidebarFolderItem";
import { SidebarFolderLoading } from "./components/SidebarFolderLoading";
import { SidebarNavItem } from "./components/SidebarNavItem";
import { SidebarTagItem } from "./components/SidebarTagItem";

export const Sidebar = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [foldersFolding, setFoldersFolding] = useState<boolean>(true);
  const [tagsFolding, setTagsFolding] = useState<boolean>(true);
  const [isCreatingFolder, setIsCreatingFolder] = useState<boolean>(false);
  const { workspace } = useSessionContext();
  const client = createClient();

  // ✅ workspace가 로드될 때까지 쿼리 실행 지연
  const workspaceId = workspace?.id;

  // 폴더 목록 조회
  const { data: folders = [] } = useSuspenseQuery(folderQueries.list(client));

  // 폴더 생성 mutation
  const createFolderMutation = useCreateFolder(workspaceId ?? "");

  // 태그 목록 조회 (workspace 로드 후에만 실행)
  const { data: tags = [] } = useQuery({
    ...tagQueries.list({ workspaceId }),
    enabled: !!workspaceId,
  });

  // Inbox 노트 목록 조회 (뱃지용, workspace 로드 후에만 실행)
  const { data: inboxData } = useQuery({
    ...noteQueries.list({
      workspaceId,
      filter: { folderId: null },
    }),
    enabled: !!workspaceId,
  });

  const inboxTotalCount = inboxData?.totalCount || 0;

  // 휴지통 노트 목록 조회 (알림용, workspace 로드 후에만 실행)
  const { data: trashData } = useQuery({
    ...noteQueries.trash({ workspaceId }),
    enabled: !!workspaceId,
  });

  const trashTotalCount = trashData?.totalCount || 0;

  const handleCreateFolder = (name: string) => {
    setIsCreatingFolder(false);

    createFolderMutation.mutate(
      { name },
      {
        onError: (error) => {
          logger.error("Failed to create folder", { error });
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
                icon="inbox_16"
                label="Inbox"
                badge={inboxTotalCount}
                active={
                  pathname === "/dashboard" &&
                  !searchParams.get("folderId") &&
                  !searchParams.get("tagId")
                }
              />

              {/* 북마크 */}
              <SidebarNavItem
                href="/bookmarks"
                icon="bookmark_16"
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
                  {folders.length === 0 && (
                    <Icon
                      name={foldersFolding ? "arrow_up_16" : "arrow_down_16"}
                      className="text-inherit"
                    />
                  )}
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

                    <div className="flex flex-col">
                      {folders.map((folder) => (
                        <SidebarFolderItem
                          key={folder.id}
                          folderId={folder.id}
                          href={`/dashboard?folderId=${folder.id}`}
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
                    className="flex w-full cursor-pointer items-center gap-2 text-neutral-600 text-sm transition-colors hover:text-base-foreground"
                    onClick={() => {
                      setFoldersFolding(true);
                      setIsCreatingFolder(true);
                    }}
                  >
                    <Icon name="plus_16" className="text-color-[inherit]" />
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
                  {tags.length > 0 && (
                    <Icon
                      name={tagsFolding ? "arrow_up_16" : "arrow_down_16"}
                      className="text-inherit"
                    />
                  )}
                </button>
              </div>

              {tagsFolding &&
                tags.map((tag) => {
                  const active =
                    pathname === "/dashboard" &&
                    searchParams.get("tagId") === tag.id;
                  return (
                    <SidebarTagItem
                      key={tag.id}
                      tagId={tag.id}
                      tagStyle={tag.style}
                      href={`/dashboard?tagId=${tag.id}`}
                      icon="tag_16"
                      label={tag.name}
                      active={active}
                    />
                  );
                })}
              {/* 태그 노데이터 */}
              {tags.length === 0 && (
                <div className="flex h-8 items-center px-3">
                  <span className="text-[15px] text-base-disabled">
                    태그없음
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-1">
            {/* 설정 */}
            {/* <SidebarNavItem
              href="/settings"
              icon="setting_20"
              label="설정"
              active={pathname === "/settings"}
            /> */}
            {/* 휴지통 */}
            <SidebarNavItem
              href="/trash"
              icon="trash_16"
              label="휴지통"
              active={pathname === "/trash"}
              rightSection={
                trashTotalCount > 0 && (
                  <Tooltip
                    trigger={
                      <Icon
                        name="notice_16"
                        className="cursor-pointer text-neutral-600 transition-colors hover:text-neutral-500"
                      />
                    }
                  >
                    휴지통에 항목이 있습니다. 스토리지 용량 확보를 위해서 <br />
                    휴지통을 비워주세요.
                  </Tooltip>
                )
              }
            />
          </div>
        </div>
      </ScrollArea>
    </nav>
  );
};

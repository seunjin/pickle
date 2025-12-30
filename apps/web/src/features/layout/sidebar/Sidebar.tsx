"use client";
import { Icon } from "@pickle/icons";
import { TAG_VARIANTS } from "@pickle/ui";
import { useState } from "react";
import { useSessionContext } from "@/features/auth";
import { SidebarFolderItem } from "./components/SidebarFolderItem";
import { SidebarNavItem } from "./components/SidebarNavItem";

export const Sidebar = () => {
  const [foldersFolding, setFoldersFolding] = useState<boolean>(false);
  const [tagsFolding, setTagsFolding] = useState<boolean>(false);
  const { isLoading } = useSessionContext();

  if (isLoading) {
    return (
      <nav className="flex h-full flex-col gap-4 p-4">
        <div className="h-8 w-3/4 animate-pulse rounded bg-neutral-800" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-neutral-800" />
      </nav>
    );
  }

  return (
    <nav className="flex h-full flex-col bg-neutral-900 px-3 py-[30px]">
      {/* 상단: 로고 영역 */}
      <div className="flex items-center justify-between pb-10">
        {/* 로고 placeholder */}
        <div className="flex items-center gap-1.5">
          <div className="h-6 w-6 rounded bg-base-primary" />
          <span className="font-bold text-lg text-neutral-200">pickle</span>
        </div>
      </div>

      {/* 메뉴 섹션 */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        {/* 주요 메뉴 */}
        <div className="pb-[30px]">
          <ul className="flex flex-col gap-1 pb-[30px]">
            <SidebarNavItem
              href="/dashboard"
              icon="archive"
              label="Inbox"
              badge={3}
              active
            />

            <SidebarNavItem
              href="/favorites"
              icon="bookmark"
              label="즐겨찾기"
            />
          </ul>

          {/* NOTES 섹션 */}
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
                  name={foldersFolding ? "arrow_up" : "arrow_down"}
                  className="text-inherit"
                  size={"16"}
                />
              </button>
            </div>

            <ul className="flex flex-col gap-1">
              {/* 폴더 아이템들 */}
              {foldersFolding && (
                <>
                  <SidebarFolderItem
                    href="/dashboard"
                    icon="folder"
                    label={"제목없음1"}
                  />
                  <SidebarFolderItem
                    href="/dashboard"
                    icon="folder"
                    label={"제목없음2"}
                  />
                  <SidebarFolderItem
                    href="/dashboard"
                    icon="folder"
                    label={"제목없음3"}
                  />
                </>
              )}

              {/* 새 노트 버튼 */}
              <li className="px-3 py-2">
                <button
                  type="button"
                  className="flex w-full cursor-pointer items-center gap-2 text-base-muted text-sm transition-colors hover:text-base-foreground active:text-base-primary"
                  onClick={() => setFoldersFolding(true)}
                >
                  <Icon
                    name="plus"
                    size={"20"}
                    className="text-color-[inherit]"
                  />
                  <span>새 노트 생성하기</span>
                </button>
              </li>
            </ul>
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
                  name={tagsFolding ? "arrow_up" : "arrow_down"}
                  className="text-inherit"
                  size={"16"}
                />
              </button>
            </div>
            {tagsFolding && (
              <ul>
                {[
                  {
                    id: 1,
                    style: "purple",
                    name: "design",
                  },
                  {
                    id: 2,
                    style: "rose",
                    name: "dev",
                  },
                  {
                    id: 3,
                    style: "green",
                    name: "ideation",
                  },
                  {
                    id: 4,
                    style: "orange",
                    name: "planning",
                  },
                  {
                    id: 5,
                    style: "yellow",
                    name: "inspiration",
                  },
                  {
                    id: 6,
                    style: "blue",
                    name: "strategy",
                  },
                ].map((tag) => {
                  const style =
                    TAG_VARIANTS[tag.style as keyof typeof TAG_VARIANTS];
                  return (
                    <li
                      key={tag.id}
                      className="group flex h-9 cursor-pointer items-center gap-2 rounded-sm px-3 transition-[background-color] hover:bg-base-foreground-background"
                    >
                      <Icon
                        name="tag"
                        size={"20"}
                        className={style.baseColor}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-muted-foreground transition-colors group-hover:text-base-foreground">
                          {tag.name}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-auto">
          {/* 설정 */}
          <SidebarNavItem href="/trash" icon="setting" label="설정" />
          {/* 휴지통 */}
          <SidebarNavItem href="/trash" icon="trash" label="휴지통" />
        </div>
      </div>
    </nav>
  );
};

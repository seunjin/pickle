"use client";

import { Icon } from "@pickle/icons";
import { InputWithAddon } from "@pickle/ui";
import { usePathname } from "next/navigation";
import { useUser } from "@/features/auth/model/useUser";

const ROUTE_CONFIG: Record<string, { title: string; placeholder: string }> = {
  "/dashboard": {
    title: "Inbox",
    placeholder: "검색어를 입력해 주세요.",
  },
  "/bookmarks": {
    title: "Bookmarks",
    placeholder: "북마크 검색...",
  },
  "/trash": {
    title: "Trash",
    placeholder: "휴지통 검색...",
  },
};

export function AppHeader() {
  const pathname = usePathname();
  const { appUser } = useUser();

  // 현재 경로에 맞는 설정 찾기 (기본값 Inbox)
  const config = ROUTE_CONFIG[pathname] || ROUTE_CONFIG["/dashboard"];
  const avatar_url = appUser?.avatar_url;

  return (
    <header className="flex h-[60px] shrink-0 items-center justify-between border-base-border border-b bg-base-background px-10">
      <div>
        <h1 className="font-bold text-[20px] text-base-foreground leading-none">
          {config.title}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <InputWithAddon
          containerClassName="group w-90"
          placeholder={config.placeholder}
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

"use client";

import { Icon } from "@pickle/icons";
import { Skeleton } from "@pickle/ui";

/**
 * 폴더 생성 API 호출 중 표시될 스켈레톤 컴포넌트
 */
export const SidebarFolderLoading = () => {
  return (
    <div className="flex h-9 items-center gap-2 px-3">
      <Icon name="folder_20" className="shrink-0" />
      <Skeleton className="h-[28px] flex-1 rounded-md" />
    </div>
  );
};

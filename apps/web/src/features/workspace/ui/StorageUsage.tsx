"use client";

import {
  MAX_STORAGE_BYTES,
  MAX_STORAGE_MB,
  STORAGE_WARNING_THRESHOLD,
} from "@pickle/contracts";
import { cn } from "@pickle/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useSessionContext } from "@/features/auth";
import { workspaceQueries } from "../model/workspaceQueries";

/**
 * 스토리지 사용량을 프로그레스 바 형태로 표시하는 컴포넌트
 */
export const StorageUsage = () => {
  const { workspace } = useSessionContext();

  const { data: usageBytes = 0, isLoading } = useQuery(
    workspaceQueries.usage(workspace?.id || ""),
  );

  if (isLoading || !workspace) return null;

  const usageMB = usageBytes / (1024 * 1024);
  const percentage = Math.min((usageBytes / MAX_STORAGE_BYTES) * 100, 100);
  const isWarning = usageBytes >= MAX_STORAGE_BYTES * STORAGE_WARNING_THRESHOLD;

  return (
    <div className="flex min-w-[120px] flex-col gap-1.5">
      <div className="flex items-center justify-between font-medium text-[11px]">
        <span
          className={cn(
            "transition-colors",
            isWarning ? "text-orange-500" : "text-base-muted-foreground",
          )}
        >
          스토리지 사용량
        </span>
        <span className="text-base-muted-foreground">
          {usageMB.toFixed(1)} / {MAX_STORAGE_MB}MB
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full border border-base-border-light/50 bg-neutral-800">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            isWarning ? "bg-orange-500" : "bg-neutral-400",
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

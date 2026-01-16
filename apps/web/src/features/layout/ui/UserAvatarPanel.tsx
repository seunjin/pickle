"use client";

import { Icon } from "@pickle/icons";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@pickle/ui";
import { cn } from "@pickle/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { useSessionContext, useSignOut, useUser } from "@/features/auth";
import { workspaceQueries } from "@/features/workspace/model/workspaceQueries";
import { StorageUsage } from "@/features/workspace/ui/StorageUsage";
import { formatBytes } from "@/shared/lib/file";

export function UserAvatarPanel() {
  const { appUser } = useUser();
  const { signOut } = useSignOut();
  const { workspace } = useSessionContext();
  const [open, setOpen] = useState(false);

  const { data: usage } = useQuery(workspaceQueries.usage(workspace?.id || ""));

  const avatar_url = appUser?.avatar_url;

  if (!avatar_url) return null;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="group/avatar inline-flex shrink-0 items-center gap-0.5 overflow-hidden outline-none"
        >
          <img
            src={avatar_url}
            alt="Avatar"
            className="size-8 rounded-full border border-base-border object-cover"
          />
          <Icon
            name={open ? "arrow_up_16" : "arrow_down_16"}
            className={cn(
              "transition-colors group-hover/avatar:text-neutral-300",
              open && "text-neutral-300",
            )}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[260px] px-2 pt-5 pb-3">
        {/* 프로필 */}
        <div className="px-3 pb-4">
          <div className="flex items-center gap-3 pb-5">
            <img
              src={avatar_url}
              alt="Avatar"
              className="size-10 rounded-full border border-base-border object-cover"
            />
            <div className="flex flex-col justify-center gap-1">
              <span className="font-medium text-[13px] text-neutral-200 leading-none">
                {appUser?.full_name}
              </span>
              <span className="text-[13px] text-muted-foreground leading-none">
                {appUser?.email}
              </span>
            </div>
          </div>
          <Button className="w-full" size={"h32"}>
            플랜 업그레이드
          </Button>
        </div>

        <DropdownMenuSeparator className="-mx-2" />

        {/* 스토리지 사용량 */}
        <div className="pt-5 pb-4">
          <div className="flex flex-col gap-4 px-3">
            <span className="font-medium text-[13px] text-neutral-200 leading-none">
              스토리지 사용량
            </span>
            <div className="pb-3">
              <StorageUsage />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 rounded-lg bg-neutral-900 p-3 text-[11px] text-neutral-500">
            <div className="flex justify-between">
              <span>이미지</span>
              <span className="text-neutral-300">
                {formatBytes(usage?.asset_bytes || 0, 1)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>북마크</span>
              <span className="text-neutral-300">
                {formatBytes(usage?.bookmark_bytes || 0, 1)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>텍스트</span>
              <span className="text-neutral-300">
                {formatBytes(usage?.text_bytes || 0, 1)}
              </span>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator className="-mx-2" />

        <div className="flex flex-col gap-[5px] pt-2">
          <DropdownMenuItem asChild>
            <Link href="/settings">
              <button type="button" className="flex w-full items-center gap-2">
                <Icon name="setting_16" /> 계정 설정
              </button>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <button type="button" className="flex w-full items-center gap-2">
              <Icon name="document_16" /> 피클약관
            </button>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <button
              type="button"
              onClick={() => signOut()}
              className="flex w-full items-center gap-2"
            >
              <Icon name="logout_16" />
              로그아웃
            </button>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

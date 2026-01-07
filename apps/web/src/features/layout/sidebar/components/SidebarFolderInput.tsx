"use client";

import { Icon } from "@pickle/icons";
import { Input } from "@pickle/ui";
import { cn } from "@pickle/ui/lib/utils";
import { useEffect, useRef, useState } from "react";

interface SidebarFolderInputProps {
  onCreate: (name: string) => void;
  onCancel: () => void;
}

/**
 * 새 폴더 생성을 위한 입력창 컴포넌트
 */
export const SidebarFolderInput = ({
  onCreate,
  onCancel,
}: SidebarFolderInputProps) => {
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    if (name.trim()) {
      onCreate(name.trim());
    } else {
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
    if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <div className="relative">
      {/* 외부 클릭 감지를 위한 투명 레이어 */}
      <button
        type="button"
        className="fixed inset-0 z-40 cursor-default bg-transparent"
        onClick={(e) => {
          e.stopPropagation();
          onCancel();
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") onCancel();
        }}
        aria-label="닫기"
      />

      <div className="relative h-9">
        <div
          className={cn(
            "absolute top-[50%] left-[50%] z-50 flex h-full w-full translate-x-[-50%] translate-y-[-50%] items-center gap-2 rounded-lg px-3",
            // "h-[46px] bg-neutral-850 shadow-md outline outline-base-border-light"
          )}
        >
          <Icon name="folder_20" className="shrink-0" />
          <Input
            ref={inputRef}
            type="text"
            size={"mini"}
            value={name}
            placeholder="폴더 이름 입력..."
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>
    </div>
  );
};

import { TAG_COLORS, type TagColor } from "@pickle/contracts";
import { Icon } from "@pickle/icons";
import { Input, TAG_VARIANTS } from "@pickle/ui";
import { cn } from "@pickle/ui/lib/utils";
import { useState } from "react";
import { useFolderNameInput } from "../hooks/useFolderNameInput";

interface SidebarTagInputProps {
  onCreate: (name: string, style: TagColor) => void;
  onCancel: () => void;
}

/**
 * 새 태그 생성을 위한 입력창 컴포넌트
 */
export const SidebarTagInput = ({
  onCreate,
  onCancel,
}: SidebarTagInputProps) => {
  // 태그명 입력도 폴더명 입력 로직을 재사용 (글자수 제한 등)
  const { name, handleChange, maxLength } = useFolderNameInput();

  // 처음 마운트 시 랜덤 색상 지정
  const [randomColor] = useState<TagColor>(() => {
    return TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];
  });

  const handleSubmit = () => {
    if (name) {
      onCreate(name, randomColor);
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
          )}
        >
          <Icon
            name="tag_16"
            className={cn("shrink-0", TAG_VARIANTS[randomColor].baseColor)}
          />
          <Input
            autoFocus
            type="text"
            size={"mini"}
            value={name}
            placeholder="태그명은 30자로 제한됩니다."
            maxLength={maxLength}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>
    </div>
  );
};

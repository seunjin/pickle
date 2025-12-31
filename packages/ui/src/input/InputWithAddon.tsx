import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "../lib/utils";

// 1. Wrapper용 CVA: 기존 inputVariants의 "박스 모델"과 "포커스" 관련 스타일을 가져옵니다.
// - focus-visible 대신 focus-within을 사용하여 내부 인풋이 포커스될 때 박스가 빛나게 합니다.
const inputContainerVariants = cva(
  [
    "flex w-full items-center rounded-md border border-form-input-border bg-form-input-background text-base-foreground transition-[color,box-shadow]",
    "focus-within:outline-none focus-within:ring-[1px] focus-within:ring-base-primary", // focus-within으로 변경
    "has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50", // 내부 인풋이 disabled일 때 스타일 (Tailwind v3.4+ 'has-' 지원 시)
    "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
  ],
  {
    variants: {
      size: {
        standard: "h-10 px-3",
        mini: "h-8 px-2",
      },
    },
    defaultVariants: {
      size: "standard",
    },
  },
);

export interface InputWithAddonProps
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof inputContainerVariants> {
  startAddon?: React.ReactNode;
  endAddon?: React.ReactNode;
  containerClassName?: string; // 래퍼 div에 별도 클래스를 주고 싶을 때
}

const InputWithAddon = React.forwardRef<HTMLInputElement, InputWithAddonProps>(
  (
    { className, size, startAddon, endAddon, containerClassName, ...props },
    ref,
  ) => {
    return (
      <div
        className={cn(
          inputContainerVariants({ size, className: containerClassName }),
        )}
      >
        {/* 왼쪽 요소 */}
        {startAddon && (
          <div className="mr-2 flex shrink-0 items-center text-muted-foreground">
            {startAddon}
          </div>
        )}

        {/* 실제 Input: 배경과 테두리를 없애고 부모를 가득 채웁니다. */}
        <input
          ref={ref}
          className={cn(
            "h-full w-full flex-1 border-none bg-transparent outline-none",
            "placeholder:text-form-input-placeholder", // 플레이스홀더 스타일 유지
            "file:border-0 file:bg-transparent file:font-medium file:text-sm", // 파일 인풋 스타일 유지
            "disabled:cursor-not-allowed",
            // 사이즈에 따른 폰트 크기 조정 (mini일 때 텍스트 크기 조정 필요 시)
            size === "mini" ? "text-[13px]" : "text-[14px]",
            className,
          )}
          {...props}
        />

        {/* 오른쪽 요소 */}
        {endAddon && (
          <div className="ml-2 flex shrink-0 items-center text-muted-foreground">
            {endAddon}
          </div>
        )}
      </div>
    );
  },
);

InputWithAddon.displayName = "InputWithAddon";

export { InputWithAddon };

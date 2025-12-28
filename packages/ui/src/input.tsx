import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "./lib/utils";

const inputVariants = cva(
  [
    /* 1. 레이아웃 & 박스 모델 */
    "w-full min-w-0 rounded-md",

    /* 2. 배경 & 테두리 & 그림자 */
    "border border-form-input-border bg-form-input-background text-base-foreground outline-none",

    /* 3. 타이포그래피 */
    "text-base placeholder:text-form-input-placeholder",

    /* 4. 애니메이션 & 상태 전환 */
    "transition-[color,box-shadow]",

    /* 5. 포커스 상태 (링 스타일) */
    "focus-visible:ring-[1px] focus-visible:ring-base-primary",

    /* 6. 선택(Selection) 스타일 */
    "selection:bg-base-muted-foreground",

    /* 7. 파일 인풋(File Input) 전용 스타일 */
    "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm",

    /* 8. 비활성화(Disabled) 상태 */
    "disabled:cursor-not-allowed disabled:text-form-input-disabled-foreground",

    /* 9. 유효성 검사 실패 (Error State) */
    "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
  ],
  {
    variants: {
      variant: {
        default: "",
        ghost: "border-none px-0 shadow-none focus-visible:ring-0",
      },
      size: {
        standard: "h-10 px-3",
        mini: "h-8 px-2 text-[13px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "standard",
    },
  },
);

export interface InputProps
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof inputVariants> {}

function Input({ className, type, variant, size, ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(inputVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Input, inputVariants };

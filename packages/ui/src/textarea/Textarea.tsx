import * as React from "react";
import { cn } from "../lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        /* 1. 레이아웃 & 박스 모델 */
        "field-sizing-content block max-h-100 min-h-[66px] w-full min-w-0 resize-none rounded-md p-3",

        /* 2. 배경 & 테두리 & 그림자 */
        "border border-form-input-border bg-form-input-background text-base-foreground outline-none",

        /* 3. 타이포그래피 */
        "text-sm placeholder:text-form-input-placeholder",

        /* 4. 애니메이션 & 상태 전환 */
        "transition-[color,box-shadow]",

        /* 5. 포커스 상태 (링 스타일) */
        "focus-visible:ring-[1px] focus-visible:ring-base-primary",

        /* 6. 선택(Selection) 스타일 */
        "selection:bg-base-muted-foreground",

        /* 7. 비활성화(Disabled) 상태 */
        "disabled:cursor-not-allowed disabled:text-form-input-disabled-foreground",

        /* 8. 유효성 검사 실패 (Error State) */
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";

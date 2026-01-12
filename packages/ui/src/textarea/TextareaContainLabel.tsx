import * as React from "react";
import { useId } from "react";
import { cn } from "../lib/utils";
import type { Textarea } from "./Textarea";

export const TextareaContainLabel = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<typeof Textarea> & {
    label: string;
    required?: boolean;
    error?: string | boolean;
    urlMode?: boolean;
    readOnly?: boolean;
  }
>(({ label, required, error, urlMode, className, readOnly, ...props }, ref) => {
  const id = useId(); // 고유 ID 생성
  return (
    <div>
      <div
        className={cn(
          /* 1. 레이아웃 & 박스 모델 */
          "w-full min-w-0 rounded-md p-3",
          /* 2. 배경 & 테두리 & 그림자 */
          "border border-form-input-border bg-form-input-background text-base-foreground outline-none",
          /* 3. 타이포그래피 */
          "break-all text-base placeholder:text-form-input-placeholder",
          /* 4. 애니메이션 & 상태 전환 */
          "transition-[color,box-shadow]",
          /* 5. 포커스 상태 (링 스타일) */
          "focus-within:ring-1 focus-within:ring-base-primary",
          /* 6. 선택(Selection) 스타일 */
          "selection:bg-base-muted-foreground",
          /* 7. 읽기 전용(ReadOnly) 상태 */
          readOnly && "ring-0 focus-within:ring-0",
          error && "ring-1 ring-system-error focus-within:ring-system-error",
          className,
        )}
      >
        <div>
          <label htmlFor={id} className="flex items-center pb-1 leading-none">
            <span className="font-semibold text-[12px] text-neutral-600 leading-none">
              {label}
            </span>
            {required && (
              <span className="text-[12px] text-base-muted leading-none">
                *
              </span>
            )}
          </label>
        </div>
        <textarea
          id={id}
          ref={ref}
          className={cn(
            "field-sizing-content block min-h-[40px] w-full resize-none appearance-none border-0 bg-transparent p-0 text-sm outline-none placeholder:text-form-input-placeholder",
            /* 8. 비활성화(Disabled) 상태 */
            "disabled:cursor-not-allowed disabled:text-form-input-disabled-foreground",
            "read-only:cursor-default read-only:text-form-input-disabled-foreground",
          )}
          readOnly={readOnly}
          {...props}
        />
      </div>
      {error && (
        <p className="break-keep pt-2 text-[13px] text-system-error leading-[1.3]">
          * {error}
        </p>
      )}
    </div>
  );
});

TextareaContainLabel.displayName = "TextareaContainLabel";

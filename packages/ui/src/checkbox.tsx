"use client";

import { Icon } from "@pickle/icons";
import * as React from "react";
import { cn } from "./lib/utils";

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className="group relative inline-flex size-4 shrink-0 items-center justify-center">
        {/* 브라우저 기본 체크박스 (숨김 처리하되 기능은 유지) */}
        <input
          type="checkbox"
          className="peer absolute inset-0 z-10 cursor-pointer opacity-0 disabled:cursor-not-allowed"
          ref={ref}
          {...props}
        />

        {/* 커스텀 디자인 박스 (Visual) */}
        <div
          className={cn(
            "pointer-events-none size-4 shrink-0 rounded-[4px] border transition-all",
            // 1. Unchecked (기본)
            "border-base-muted",
            // 2. Hover (비활성화가 아닐 때만 적용)
            "group-hover:border-base-primary group-hover:bg-base-primary-active-background",
            // 3. Checked (선택됨) - Hover보다 뒤에 배치
            "peer-checked:border-base-primary peer-checked:bg-base-primary",
            // 4. Disabled (비활성화) - 모든 스타일을 덮어씌움
            "peer-disabled:border-neutral-650 peer-disabled:bg-base-disabled peer-disabled:hover:bg-base-disabled",
            // 5. Checked + Disabled (예외 처리)
            "peer-checked:peer-disabled:opacity-50",
            className,
          )}
        />

        {/* 체크 아이콘 (Icon) */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity peer-checked:opacity-100">
          <Icon name="check_mini_12" className="size-3 text-neutral-950" />
        </div>
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";

export { Checkbox };

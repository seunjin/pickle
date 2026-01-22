"use client";

import type { IconName } from "@pickle/icons";
import { Button } from "../button";
import { cn } from "../lib/utils";

interface ActionProps {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "secondary_line" | "destructive";
  icon?: IconName;
  iconSide?: "left" | "right";
}

interface ErrorViewProps {
  title?: string;
  description?: React.ReactNode;
  primaryAction?: ActionProps;
  secondaryAction?: ActionProps;
  fullHeight?: boolean;
  className?: string;
}

/**
 * 프로젝트 전반에서 사용되는 공용 에러 UI 컴포넌트입니다.
 */
export const ErrorView = ({
  title = "문제가 발생했습니다",
  description = "잠시 후 다시 시도해 주세요. 문제가 지속되면 고객센터로 문의 부탁드립니다.",
  primaryAction,
  secondaryAction,
  fullHeight = true,
  className,
}: ErrorViewProps) => {
  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center px-4 transition-all duration-300",
        fullHeight && "h-full min-h-[400px]",
        className,
      )}
    >
      <div className="flex w-full max-w-[400px] flex-col items-center text-center">
        <h1 className="mb-3 break-keep font-bold text-[28px] text-white leading-[1.3]">
          {title}
        </h1>
        <p className="mb-10 w-full break-keep text-base text-neutral-300 leading-[1.4]">
          {description}
        </p>

        <div className="flex w-full gap-3">
          {secondaryAction && (
            <Button
              variant={secondaryAction.variant ?? "secondary"}
              size="h38"
              className="flex-1 text-neutral-500"
              onClick={secondaryAction.onClick}
              icon={secondaryAction.icon}
              iconSide={secondaryAction.iconSide}
            >
              {secondaryAction.label}
            </Button>
          )}
          {primaryAction && (
            <Button
              variant={primaryAction.variant ?? "primary"}
              size="h38"
              className="flex-1"
              onClick={primaryAction.onClick}
              icon={primaryAction.icon}
              iconSide={primaryAction.iconSide}
            >
              {primaryAction.label}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

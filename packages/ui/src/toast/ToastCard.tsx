"use client";
import { Icon, type IconName } from "@pickle/icons";
import type * as React from "react";

import { Spinner } from "../spinner";
/**
 * [중요] sonner를 직접 임포트하지 않고 index.tsx의 인스턴스를 사용합니다.
 * 1. 인스턴스 파편화 방지: 모노레포 환경에서 생성/삭제 상태(Store)를 하나로 유지하기 위함
 * 2. 순환 참조 방지: index.tsx(API) -> ToastCard(UI) -> index.tsx(Instance) 순서로 흐름을 단방향화
 */
import { toastInstance as sonnerToast } from "./index";
import type { ToastKind, ToastProps } from "./types";

export interface ToastCardProps extends ToastProps {
  id: string | number;
  kind: ToastKind;
  onClose?: () => void;
}

export function ToastCard({
  id,
  kind,
  title,
  description,
  action,
  cancel,
  dismissible = false,
  className,
  style,
  onClose,
}: ToastCardProps) {
  const handleClose = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (onClose) {
      onClose();
    } else {
      sonnerToast.dismiss(id);
    }
  };

  const kindStyles: Record<ToastKind, string> = {
    info: "pickle-toast-info",
    success: "pickle-toast-success",
    error: "pickle-toast-error",
    loading: "pickle-toast-loading",
  };

  const kindIcons: Record<
    Exclude<ToastKind, "loading">,
    { icon: IconName; className: string }
  > = {
    info: { icon: "info_circle_16", className: "text-base-muted" },
    success: { icon: "check_circle_16", className: "text-system-success" },
    error: { icon: "error_circle_16", className: "text-system-error" },
  };

  return (
    <div
      className={`pickle-toast-card ${kindStyles[kind]} ${className || ""}`}
      style={style}
    >
      <div className="pickle-toast-content w-full">
        <div className="flex w-full items-center justify-between gap-4">
          <h4 className="pickle-toast-title">
            {kind === "loading" ? (
              <Spinner className="size-4" />
            ) : (
              <Icon
                name={kindIcons[kind].icon}
                className={kindIcons[kind].className}
              />
            )}
            {title}
          </h4>
          {dismissible && (
            <button type="button" onClick={handleClose} aria-label="Close">
              <Icon name="delete_16" />
            </button>
          )}
        </div>
        {description && (
          <p className="pickle-toast-description">{description}</p>
        )}
        {(action || cancel) && (
          <div className="pickle-toast-actions">
            {action && (
              <button
                type="button"
                className="pickle-toast-action-btn"
                onClick={async () => {
                  await action.onClick();
                  handleClose();
                }}
              >
                {action.label}
              </button>
            )}
            {cancel && (
              <button
                type="button"
                className="pickle-toast-close-btn"
                onClick={async () => {
                  await cancel.onClick();
                  handleClose();
                }}
              >
                {cancel.label}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

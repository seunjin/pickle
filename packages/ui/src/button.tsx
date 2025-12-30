import {
  Icon16,
  Icon20,
  type IconNameOnly16,
  type IconNameOnly20,
} from "@pickle/icons";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "./lib/utils";

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-1 whitespace-nowrap rounded-md font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: cn(
          "bg-base-primary text-neutral-950",
          "hover:bg-green-200",
          "disabled:bg-green-300/50 disabled:text-base-disabled",
        ),
        action: cn(
          "!px-0 aspect-square",
          "border border-base-border-light bg-neutral-800 text-base-muted",
          "hover:text-neutral-300",
          "disabled:text-base-disabled",
        ),
      },
      size: {
        default: cn("h-[38px] px-4", "font-semibold text-sm", "rounded-[6px]"),
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

// ============================================================
// [1] Base Props (공통)
// ============================================================
type BaseButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  Omit<VariantProps<typeof buttonVariants>, "variant"> & {
    asChild?: boolean;
    iconSide?: "left" | "right";
    size?: VariantProps<typeof buttonVariants>["size"];
  };

// ============================================================
// [2] Button.Default (16px 아이콘 전용)
// ============================================================
type DefaultButtonProps = BaseButtonProps & {
  icon?: IconNameOnly16;
};

const ButtonDefault = React.forwardRef<HTMLButtonElement, DefaultButtonProps>(
  (
    {
      className,
      asChild = false,
      iconSide = "right",
      icon,
      size = "default",
      children,
      ...rest
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant: "default", size }), className)}
        {...rest}
      >
        {icon && iconSide === "left" && (
          <Icon16 name={icon} className="text-inherit" />
        )}
        {children}
        {icon && iconSide === "right" && (
          <Icon16 name={icon} className="text-inherit" />
        )}
      </Comp>
    );
  },
);
ButtonDefault.displayName = "Button.Default";

// ============================================================
// [3] Button.Action (20px 아이콘 전용)
// ============================================================
type ActionButtonProps = BaseButtonProps & {
  icon?: IconNameOnly20;
};

const ButtonAction = React.forwardRef<HTMLButtonElement, ActionButtonProps>(
  (
    { className, asChild = false, icon, size = "default", children, ...rest },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant: "action", size }), className)}
        {...rest}
      >
        {icon && <Icon20 name={icon} className="text-inherit" />}
      </Comp>
    );
  },
);
ButtonAction.displayName = "Button.Action";

// ============================================================
// [4] Legacy Button (하위 호환용, 유니온 타입)
// ============================================================
type LegacyDefaultButtonProps = BaseButtonProps & {
  variant?: "default" | null;
  size?: "default";
  icon?: IconNameOnly16;
};

type LegacyActionButtonProps = BaseButtonProps & {
  variant: "action";
  size?: "small";
  icon?: IconNameOnly20;
};

export type ButtonProps = LegacyDefaultButtonProps | LegacyActionButtonProps;

const ButtonBase = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const {
      className,
      variant,
      size,
      asChild = false,
      iconSide = "right",
      children,
      ...rest
    } = props;

    const Comp = asChild ? Slot : "button";
    const resolvedSize = size ?? "default";

    const renderIcon = (side: "left" | "right") => {
      if (!props.icon || iconSide !== side) return null;

      if (props.variant === "action") {
        return (
          <Icon20
            name={props.icon as IconNameOnly20}
            className="text-inherit"
          />
        );
      }
      return (
        <Icon16 name={props.icon as IconNameOnly16} className="text-inherit" />
      );
    };

    return (
      <Comp
        ref={ref}
        className={cn(
          buttonVariants({ variant, size: resolvedSize }),
          className,
        )}
        {...rest}
      >
        {renderIcon("left")}
        {children}
        {renderIcon("right")}
      </Comp>
    );
  },
);
ButtonBase.displayName = "Button";

// ============================================================
// [5] Compound Component Export
// ============================================================
export const Button = Object.assign(ButtonBase, {
  Default: ButtonDefault,
  Action: ButtonAction,
});

export { buttonVariants };

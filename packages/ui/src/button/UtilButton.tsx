import { Icon, type IconName } from "@pickle/icons";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";
import { cn } from "../lib/utils";

// ============================================================
// UtilButton Variants (compoundVariants 패턴)
// ============================================================
const utilButtonVariants = cva(
  "group/util-button inline-flex cursor-pointer items-center justify-center gap-0.5 transition-colors [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-base-primary font-semibold text-neutral-950 hover:bg-green-200",
        secondary:
          "border border-base-border-light bg-neutral-800 text-base-muted-foreground hover:text-base-foreground",
        secondary_line:
          "border border-base-border-light bg-base-foreground-background text-base-muted-foreground hover:border-base-primary hover:text-base-foreground hover:text-base-primary",
        ghost: "text-base-muted-foreground hover:text-base-foreground",
      },
      size: {
        h24: "h-[24px] rounded-[6px] px-[6px_8px] text-[12px]",
        h28: "h-[28px] rounded-[6px] px-[6px_8px] text-[13px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "h28",
    },
  },
);

const iconVariants = cva("transition-colors", {
  variants: {
    variant: {
      primary: "text-neutral-950",
      secondary: "text-base-muted",
      secondary_line:
        "text-base-muted group-hover/util-button:text-base-primary",
      ghost: "text-base-muted",
    },
  },
  defaultVariants: {
    variant: "primary",
  },
});

// ============================================================
// UtilButton (아이콘 전용 버튼)
// ============================================================

type UtilButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof utilButtonVariants> & {
    asChild?: boolean;
    icon: IconName;
  };

const UtilButton = forwardRef<HTMLButtonElement, UtilButtonProps>(
  (props, ref) => {
    const {
      className,
      variant,
      size,
      asChild = false,
      icon,
      children,
      ...rest
    } = props;

    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={cn(utilButtonVariants({ variant, size }), className)}
        {...rest}
      >
        <Icon name={icon} className={iconVariants({ variant })} /> {children}
      </Comp>
    );
  },
);
UtilButton.displayName = "UtilButton";

export { UtilButton, utilButtonVariants };
export type { UtilButtonProps };

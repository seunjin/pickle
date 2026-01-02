import { Icon, type IconName } from "@pickle/icons";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";
import { cn } from "../lib/utils";

// ============================================================
// Button Variants (action 제외)
// ============================================================
const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-1 whitespace-nowrap rounded-md font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: cn(
          "bg-base-primary text-neutral-950",
          "hover:bg-green-200",
          "disabled:bg-green-300/50 disabled:text-base-disabled",
        ),
        secondary: cn(
          "bg-neutral-700 text-neutral-400",
          "hover:bg-neutral-650",
          "disabled:bg-neutral-700 disabled:text-neutral-600",
        ),
        icon: cn(
          "!px-0 aspect-square",
          "border border-base-border-light bg-neutral-800 text-base-muted",
          "hover:text-neutral-300",
          "disabled:text-base-disabled",
        ),
      },
      size: {
        h38: cn("h-[38px] px-4", "font-semibold text-sm", "rounded-[6px]"),
        h32: cn("h-[32px] px-4", "font-semibold text-[13px]", "rounded-[6px]"),
        // h26: cn("h-[26px] px-4", "font-semibold text-sm", "rounded-[4px]"),
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "h38",
    },
  },
);

// ============================================================
// Button (일반 버튼: default, icon variant)
// ============================================================
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    icon?: IconName;
    iconSide?: "left" | "right";
  };

const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const {
    className,
    variant = "primary",
    size = "h38",
    asChild = false,
    iconSide = "right",
    icon,
    children,
    ...rest
  } = props;

  const Comp = asChild ? Slot : "button";

  const renderIcon = (side: "left" | "right") => {
    if (!icon || iconSide !== side) return null;
    return <Icon name={icon} className="text-inherit" />;
  };

  return (
    <Comp
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...rest}
    >
      {renderIcon("left")}
      {children}
      {renderIcon("right")}
    </Comp>
  );
});
Button.displayName = "Button";

export { Button, buttonVariants };
export type { ButtonProps };

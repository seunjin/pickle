import { Icon, type IconName } from "@pickle/icons";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";
import { cn } from "../lib/utils";

// ============================================================
// ActionButton Variants (compoundVariants 패턴)
// ============================================================
const actionButtonVariants = cva(
  "!px-0 inline-flex aspect-square h-6.5 cursor-pointer items-center justify-center rounded-[4px] transition-[color,background-color,opacity] [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        action: "",
        subAction: "",
      },
      active: {
        true: "",
        false: "",
      },
      forceFocus: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      variant: "action",
      forceFocus: false,
    },
    compoundVariants: [
      // action + forceFocus:false
      {
        variant: "action",
        forceFocus: false,
        className:
          "text-base-muted hover:bg-neutral-800 hover:text-neutral-300 disabled:cursor-not-allowed disabled:bg-transparent disabled:text-base-disabled",
      },
      // action + forceFocus:true
      {
        variant: "action",
        forceFocus: true,
        className: "bg-neutral-800 text-neutral-300",
      },
      // subAction + forceFocus:false
      {
        variant: "subAction",
        forceFocus: false,
        className: `text-base-muted opacity-0 group-hover:opacity-100 hover:bg-neutral-650/50 hover:text-neutral-300`,
      },
      // subAction + forceFocus:true
      {
        variant: "subAction",
        forceFocus: true,
        className: "bg-neutral-650/50 text-neutral-300 opacity-100",
      },
    ],
  },
);

// ============================================================
// ActionButton (아이콘 전용 버튼)
// ============================================================
type ActionButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> &
  VariantProps<typeof actionButtonVariants> & {
    asChild?: boolean;
    icon: IconName;
  };

const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  (props, ref) => {
    const {
      className,
      variant = "action",
      forceFocus = false,
      asChild = false,
      icon,
      ...rest
    } = props;

    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={cn(actionButtonVariants({ variant, forceFocus }), className)}
        {...rest}
      >
        <Icon name={icon} className="text-inherit" />
      </Comp>
    );
  },
);
ActionButton.displayName = "ActionButton";

export { ActionButton, actionButtonVariants };
export type { ActionButtonProps };

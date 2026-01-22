import {
  OriginTooltip,
  OriginTooltipContent,
  OriginTooltipTrigger,
} from "./origin-tooltip";

interface TooltipProps {
  trigger: React.ReactNode;
  children?: React.ReactNode;
}
export function Tooltip({ trigger, children }: TooltipProps) {
  return (
    <OriginTooltip>
      <OriginTooltipTrigger>{trigger}</OriginTooltipTrigger>
      <OriginTooltipContent
        useArrow
        className="fade-in-0 zoom-in-95 data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 z-50 animate-in bg-neutral-700 px-3 py-2.5 text-[12px] text-neutral-300 leading-[1.3] shadow-standard duration-200 data-[state=closed]:animate-out"
      >
        {children}
      </OriginTooltipContent>
    </OriginTooltip>
  );
}

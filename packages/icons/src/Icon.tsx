import type { SVGProps } from "react";
import { ICON_PALETTE, type IconName } from "./icons";
import { cn } from "./lib/utils";

// ============================================================
// Icon 컴포넌트 (플랫 키 기반, size prop 불필요)
// ============================================================
export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  name: IconName;
  className?: string;
}

export const Icon = ({ name, className, ...props }: IconProps) => {
  const SvgComponent = ICON_PALETTE[name];

  if (!SvgComponent) {
    console.warn(`[Icon System] '${name}' 아이콘을 찾을 수 없습니다.`);
    return null;
  }

  // 아이콘 이름에서 마지막 숫자 추출 (예: link-12 → 12, bookmark_16 → 16)
  const sizeMatch = name.match(/[_-](\d+)$/);
  const size = sizeMatch ? Number(sizeMatch[1]) : 20;

  return (
    <SvgComponent
      width={size}
      height={size}
      className={cn("text-base-muted", className)}
      {...props}
    />
  );
};

Icon.displayName = "Icon";

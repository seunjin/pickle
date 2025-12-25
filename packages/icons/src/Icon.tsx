import type * as React from "react";
import type { SVGProps } from "react";
import { ICON_PALETTE, type IconName } from "./icons";

/**
 * 아이콘 이름(name)에 따라 가능한 사이즈(size)를 동적으로 추론하는 타입 정의
 */
export type IconSize<T extends IconName> = keyof (typeof ICON_PALETTE)[T];

export interface UnifiedIconProps<T extends IconName>
  extends Omit<SVGProps<SVGSVGElement>, "size"> {
  name: T;
  size: IconSize<T>;
}

export const Icon = <T extends IconName>({
  name,
  size,
  ...props
}: UnifiedIconProps<T>) => {
  const iconSet = ICON_PALETTE[name];

  if (!iconSet) {
    console.warn(`[Icon System] '${name}' 아이콘을 찾을 수 없습니다.`);
    return null;
  }

  const SvgComponent = iconSet[
    size as keyof typeof iconSet
  ] as React.ComponentType<SVGProps<SVGSVGElement>>;

  if (!SvgComponent) {
    console.warn(
      `[Icon System] '${name}' 아이콘은 ${String(size)}px 에셋이 없습니다.`,
    );
    return null;
  }

  return (
    <SvgComponent width={size as number} height={size as number} {...props} />
  );
};

Icon.displayName = "Icon";

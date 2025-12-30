import type { SVGProps } from "react";
import { ICON_PALETTE } from "./icons";
import { createPalette } from "./lib/createPalette";
import { cn } from "./lib/utils";
import type { IconName, IconSize } from "./types";

// ============================================================
// [1] 사이즈별 팔레트 생성 (문자열 리터럴 키 기반)
// ============================================================
export const ICON_SIZE_16 = createPalette("16", ICON_PALETTE);
export const ICON_SIZE_20 = createPalette("20", ICON_PALETTE);

export type IconNameOnly16 = keyof typeof ICON_SIZE_16;
export type IconNameOnly20 = keyof typeof ICON_SIZE_20;

// ============================================================
// [2] 기본 Icon 컴포넌트 (모든 아이콘, 사이즈는 문자열 리터럴)
// ============================================================
export interface IconProps<T extends IconName>
  extends Omit<SVGProps<SVGSVGElement>, "size"> {
  name: T;
  size: IconSize<T>;
  className?: string;
}

export const Icon = <T extends IconName>({
  name,
  size,
  className,
  ...props
}: IconProps<T>) => {
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
    <SvgComponent
      width={Number(size)}
      height={Number(size)}
      className={cn("text-base-muted", className)}
      {...props}
    />
  );
};

Icon.displayName = "Icon";

// ============================================================
// [3] 사이즈 고정 아이콘 팩토리
// ============================================================
type SvgComponent = React.ComponentType<SVGProps<SVGSVGElement>>;

interface SizedIconProps<N extends string>
  extends Omit<SVGProps<SVGSVGElement>, "name" | "size"> {
  name: N;
  className?: string;
}

const createSizedIcon = <
  S extends "16" | "20",
  P extends Record<string, { [key in S]: SvgComponent }>,
>(
  size: S,
  palette: P,
  displayName: string,
) => {
  type Names = keyof P & string;

  const SizedIcon = <T extends Names>({
    name,
    className,
    ...props
  }: SizedIconProps<T>) => {
    const iconSet = palette[name];

    if (!iconSet) {
      console.warn(`[Icon System] '${name}' 아이콘을 찾을 수 없습니다.`);
      return null;
    }

    const SvgComp = iconSet[size] as SvgComponent;

    if (!SvgComp) {
      console.warn(
        `[Icon System] '${name}' 아이콘은 ${size}px 에셋이 없습니다.`,
      );
      return null;
    }

    return (
      <SvgComp
        width={Number(size)}
        height={Number(size)}
        className={cn("text-base-muted", className)}
        {...(props as SVGProps<SVGSVGElement>)}
      />
    );
  };

  SizedIcon.displayName = displayName;
  return SizedIcon;
};

// ============================================================
// [4] Icon16 / Icon20 컴포넌트 (팩토리로 생성)
// ============================================================
export const Icon16 = createSizedIcon("16", ICON_SIZE_16, "Icon16");
export const Icon20 = createSizedIcon("20", ICON_SIZE_20, "Icon20");

// Props 타입 재노출 (외부 사용 편의)
export type Icon16Props<T extends IconNameOnly16> = SizedIconProps<T>;
export type Icon20Props<T extends IconNameOnly20> = SizedIconProps<T>;

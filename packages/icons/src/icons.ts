import type { SVGProps } from "react";
import IconLayout20 from "./react/IconLayout20";
import IconSearch20 from "./react/IconSearch20";

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  title?: string;
}

export { IconLayout20, IconSearch20 };

export const ICON_PALETTE = {
  layout: {
    20: IconLayout20,
  },
  search: {
    20: IconSearch20,
  },
} as const;

export type IconName = keyof typeof ICON_PALETTE;

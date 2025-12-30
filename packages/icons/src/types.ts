import type { ICON_PALETTE } from "./icons";

export type IconPalette = typeof ICON_PALETTE;
export type IconName = keyof IconPalette;
export type IconSize<T extends IconName> = keyof IconPalette[T];

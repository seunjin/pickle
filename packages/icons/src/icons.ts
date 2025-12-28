import type { SVGProps } from "react";
import IconArchive20 from "./react/IconArchive20";
import IconBookmark16 from "./react/IconBookmark16";
import IconBookmark20 from "./react/IconBookmark20";
import IconDelete16 from "./react/IconDelete16";
import IconEdit16 from "./react/IconEdit16";
import IconEllipsis16 from "./react/IconEllipsis16";
import IconEllipsis20 from "./react/IconEllipsis20";
import IconFolder20 from "./react/IconFolder20";
import IconLayout20 from "./react/IconLayout20";
import IconLayoutCard16 from "./react/IconLayoutCard16";
import IconLayoutList16 from "./react/IconLayoutList16";
import IconMove16 from "./react/IconMove16";
import IconNoteEmpty20 from "./react/IconNoteEmpty20";
import IconNoteFull20 from "./react/IconNoteFull20";
import IconPlus16 from "./react/IconPlus16";
import IconPlus20 from "./react/IconPlus20";
import IconSample20 from "./react/IconSample20";
import IconSearch20 from "./react/IconSearch20";
import IconSetting20 from "./react/IconSetting20";
import IconTag20 from "./react/IconTag20";
import IconTrash16 from "./react/IconTrash16";
import IconTrash20 from "./react/IconTrash20";

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  title?: string;
}

export {
  IconArchive20,
  IconBookmark16,
  IconBookmark20,
  IconDelete16,
  IconEdit16,
  IconEllipsis16,
  IconEllipsis20,
  IconFolder20,
  IconLayout20,
  IconLayoutCard16,
  IconLayoutList16,
  IconMove16,
  IconNoteEmpty20,
  IconNoteFull20,
  IconPlus16,
  IconPlus20,
  IconSample20,
  IconSearch20,
  IconSetting20,
  IconTag20,
  IconTrash16,
  IconTrash20,
};

export const ICON_PALETTE = {
  archive: {
    20: IconArchive20,
  },
  bookmark: {
    16: IconBookmark16,
    20: IconBookmark20,
  },
  delete: {
    16: IconDelete16,
  },
  edit: {
    16: IconEdit16,
  },
  ellipsis: {
    16: IconEllipsis16,
    20: IconEllipsis20,
  },
  folder: {
    20: IconFolder20,
  },
  layout: {
    20: IconLayout20,
  },
  layout_card: {
    16: IconLayoutCard16,
  },
  layout_list: {
    16: IconLayoutList16,
  },
  move: {
    16: IconMove16,
  },
  note_empty: {
    20: IconNoteEmpty20,
  },
  note_full: {
    20: IconNoteFull20,
  },
  plus: {
    16: IconPlus16,
    20: IconPlus20,
  },
  sample: {
    20: IconSample20,
  },
  search: {
    20: IconSearch20,
  },
  setting: {
    20: IconSetting20,
  },
  tag: {
    20: IconTag20,
  },
  trash: {
    16: IconTrash16,
    20: IconTrash20,
  },
} as const;

export type IconName = keyof typeof ICON_PALETTE;

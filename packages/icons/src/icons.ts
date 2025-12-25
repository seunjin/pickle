import type { SVGProps } from "react";
import IconArchive20 from "./react/IconArchive20";
import IconBookmark20 from "./react/IconBookmark20";
import IconLayout20 from "./react/IconLayout20";
import IconNoteEmpty20 from "./react/IconNoteEmpty20";
import IconNoteFull20 from "./react/IconNoteFull20";
import IconPlus20 from "./react/IconPlus20";
import IconSample20 from "./react/IconSample20";
import IconSearch20 from "./react/IconSearch20";
import IconTag20 from "./react/IconTag20";
import IconTrash20 from "./react/IconTrash20";

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  title?: string;
}

export {
  IconArchive20,
  IconBookmark20,
  IconLayout20,
  IconNoteEmpty20,
  IconNoteFull20,
  IconPlus20,
  IconSample20,
  IconSearch20,
  IconTag20,
  IconTrash20,
};

export const ICON_PALETTE = {
  archive: {
    20: IconArchive20,
  },
  bookmark: {
    20: IconBookmark20,
  },
  layout: {
    20: IconLayout20,
  },
  note_empty: {
    20: IconNoteEmpty20,
  },
  note_full: {
    20: IconNoteFull20,
  },
  plus: {
    20: IconPlus20,
  },
  sample: {
    20: IconSample20,
  },
  search: {
    20: IconSearch20,
  },
  tag: {
    20: IconTag20,
  },
  trash: {
    20: IconTrash20,
  },
} as const;

export type IconName = keyof typeof ICON_PALETTE;

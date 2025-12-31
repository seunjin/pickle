import IconArchive20 from "./react/IconArchive20";
import IconArrowDown16 from "./react/IconArrowDown16";
import IconArrowLeft16 from "./react/IconArrowLeft16";
import IconArrowRight16 from "./react/IconArrowRight16";
import IconArrowUp16 from "./react/IconArrowUp16";
import IconBookmark16 from "./react/IconBookmark16";
import IconBookmark20 from "./react/IconBookmark20";
import IconCheck16 from "./react/IconCheck16";
import IconDelete16 from "./react/IconDelete16";
import IconDownload16 from "./react/IconDownload16";
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
import IconSetting16 from "./react/IconSetting16";
import IconSetting20 from "./react/IconSetting20";
import IconTag20 from "./react/IconTag20";
import IconTrash16 from "./react/IconTrash16";
import IconTrash20 from "./react/IconTrash20";

export {
  IconArchive20,
  IconArrowDown16,
  IconArrowLeft16,
  IconArrowRight16,
  IconArrowUp16,
  IconBookmark16,
  IconBookmark20,
  IconCheck16,
  IconDelete16,
  IconDownload16,
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
  IconSetting16,
  IconSetting20,
  IconTag20,
  IconTrash16,
  IconTrash20,
};

export const ICON_PALETTE = {
  archive_20: IconArchive20,
  arrow_down_16: IconArrowDown16,
  arrow_left_16: IconArrowLeft16,
  arrow_right_16: IconArrowRight16,
  arrow_up_16: IconArrowUp16,
  bookmark_16: IconBookmark16,
  bookmark_20: IconBookmark20,
  check_16: IconCheck16,
  delete_16: IconDelete16,
  download_16: IconDownload16,
  edit_16: IconEdit16,
  ellipsis_16: IconEllipsis16,
  ellipsis_20: IconEllipsis20,
  folder_20: IconFolder20,
  layout_20: IconLayout20,
  layout_card_16: IconLayoutCard16,
  layout_list_16: IconLayoutList16,
  move_16: IconMove16,
  note_empty_20: IconNoteEmpty20,
  note_full_20: IconNoteFull20,
  plus_16: IconPlus16,
  plus_20: IconPlus20,
  sample_20: IconSample20,
  search_20: IconSearch20,
  setting_16: IconSetting16,
  setting_20: IconSetting20,
  tag_20: IconTag20,
  trash_16: IconTrash16,
  trash_20: IconTrash20,
} as const;

export type IconName = keyof typeof ICON_PALETTE;

export const TAG_COLORS = [
  "purple",
  "blue",
  "green",
  "orange",
  "pink",
  "red",
  "yellow",
  "gray",
  "cyan",
  "indigo",
  "violet",
  "magenta",
  "lime",
  "emerald",
  "rose",
  "brown",
] as const;

export type TagColor = (typeof TAG_COLORS)[number];

export const TAG_VARIANTS: Record<TagColor, string> = {
  purple: "text-tag-purple bg-tag-purple/10 border-tag-purple/20",
  blue: "text-tag-blue bg-tag-blue/10 border-tag-blue/20",
  green: "text-tag-green bg-tag-green/10 border-tag-green/20",
  orange: "text-tag-orange bg-tag-orange/10 border-tag-orange/20",
  pink: "text-tag-pink bg-tag-pink/10 border-tag-pink/20",
  red: "text-tag-red bg-tag-red/10 border-tag-red/20",
  yellow: "text-tag-yellow bg-tag-yellow/10 border-tag-yellow/20",
  gray: "text-tag-gray bg-tag-gray/10 border-tag-gray/20",
  cyan: "text-tag-cyan bg-tag-cyan/10 border-tag-cyan/20",
  indigo: "text-tag-indigo bg-tag-indigo/10 border-tag-indigo/20",
  violet: "text-tag-violet bg-tag-violet/10 border-tag-violet/20",
  magenta: "text-tag-magenta bg-tag-magenta/10 border-tag-magenta/20",
  lime: "text-tag-lime bg-tag-lime/10 border-tag-lime/20",
  emerald: "text-tag-emerald bg-tag-emerald/10 border-tag-emerald/20",
  rose: "text-tag-rose bg-tag-rose/10 border-tag-rose/20",
  brown: "text-tag-brown bg-tag-brown/10 border-tag-brown/20",
};

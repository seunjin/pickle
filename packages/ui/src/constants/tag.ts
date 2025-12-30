export const TAG_COLORS = [
  "red",
  "rose",
  "orange",
  "brown",
  "yellow",
  "lime",
  "green",
  "emerald",
  "cyan",
  "blue",
  "indigo",
  "violet",
  "purple",
  "pink",
  "magenta",
  "gray",
] as const;

export type TagColor = (typeof TAG_COLORS)[number];

export const TAG_VARIANTS: Record<
  TagColor,
  {
    baseColor: string;
    tagColor: string;
    buttonColor: string;
    paletteColor: string;
  }
> = {
  purple: {
    baseColor: "text-tag-purple",
    tagColor: "text-tag-purple bg-tag-purple/10 border-tag-purple/20",
    buttonColor: "text-tag-purple/50",
    paletteColor: "bg-tag-purple/70 border-tag-purple/70",
  },
  blue: {
    baseColor: "text-tag-blue",
    tagColor: "text-tag-blue bg-tag-blue/10 border-tag-blue/20",
    buttonColor: "text-tag-blue/50",
    paletteColor: "bg-tag-blue/70 border-tag-blue/70",
  },
  green: {
    baseColor: "text-tag-green",
    tagColor: "text-tag-green bg-tag-green/10 border-tag-green/20",
    buttonColor: "text-tag-green/50",
    paletteColor: "bg-tag-green/70 border-tag-green/70",
  },
  orange: {
    baseColor: "text-tag-orange",
    tagColor: "text-tag-orange bg-tag-orange/10 border-tag-orange/20",
    buttonColor: "text-tag-orange/50",
    paletteColor: "bg-tag-orange/70 border-tag-orange/70",
  },
  pink: {
    baseColor: "text-tag-pink",
    tagColor: "text-tag-pink bg-tag-pink/10 border-tag-pink/20",
    buttonColor: "text-tag-pink/50",
    paletteColor: "bg-tag-pink/70 border-tag-pink/70",
  },
  red: {
    baseColor: "text-tag-red",
    tagColor: "text-tag-red bg-tag-red/10 border-tag-red/20",
    buttonColor: "text-tag-red/50",
    paletteColor: "bg-tag-red/70 border-tag-red/70",
  },
  yellow: {
    baseColor: "text-tag-yellow",
    tagColor: "text-tag-yellow bg-tag-yellow/10 border-tag-yellow/20",
    buttonColor: "text-tag-yellow/50",
    paletteColor: "bg-tag-yellow/70 border-tag-yellow/70",
  },
  gray: {
    baseColor: "text-tag-gray",
    tagColor: "text-tag-gray bg-tag-gray/10 border-tag-gray/20",
    buttonColor: "text-tag-gray/50",
    paletteColor: "bg-tag-gray/70 border-tag-gray/70",
  },
  cyan: {
    baseColor: "text-tag-cyan",
    tagColor: "text-tag-cyan bg-tag-cyan/10 border-tag-cyan/20",
    buttonColor: "text-tag-cyan/50",
    paletteColor: "bg-tag-cyan/70 border-tag-cyan/70",
  },
  indigo: {
    baseColor: "text-tag-indigo",
    tagColor: "text-tag-indigo bg-tag-indigo/10 border-tag-indigo/20",
    buttonColor: "text-tag-indigo/50",
    paletteColor: "bg-tag-indigo/70 border-tag-indigo/70",
  },
  violet: {
    baseColor: "text-tag-violet",
    tagColor: "text-tag-violet bg-tag-violet/10 border-tag-violet/20",
    buttonColor: "text-tag-violet/50",
    paletteColor: "bg-tag-violet/70 border-tag-violet/70",
  },
  magenta: {
    baseColor: "text-tag-magenta",
    tagColor: "text-tag-magenta bg-tag-magenta/10 border-tag-magenta/20",
    buttonColor: "text-tag-magenta/50",
    paletteColor: "bg-tag-magenta/70 border-tag-magenta/70",
  },
  lime: {
    baseColor: "text-tag-lime",
    tagColor: "text-tag-lime bg-tag-lime/10 border-tag-lime/20",
    buttonColor: "text-tag-lime/50",
    paletteColor: "bg-tag-lime/70 border-tag-lime/70",
  },
  emerald: {
    baseColor: "text-tag-emerald",
    tagColor: "text-tag-emerald bg-tag-emerald/10 border-tag-emerald/20",
    buttonColor: "text-tag-emerald/50",
    paletteColor: "bg-tag-emerald/70 border-tag-emerald/70",
  },
  rose: {
    baseColor: "text-tag-rose",
    tagColor: "text-tag-rose bg-tag-rose/10 border-tag-rose/20",
    buttonColor: "text-tag-rose/50",
    paletteColor: "bg-tag-rose/70 border-tag-rose/70",
  },
  brown: {
    baseColor: "text-tag-brown",
    tagColor: "text-tag-brown bg-tag-brown/10 border-tag-brown/20",
    buttonColor: "text-tag-brown/50",
    paletteColor: "bg-tag-brown/70 border-tag-brown/70",
  },
};

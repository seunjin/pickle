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

export const TAG_VARIANTS: Record<
  TagColor,
  {
    textColor: string;
    backgroundColor: string;
    borderColor: string;
    buttonColor: string;
  }
> = {
  purple: {
    textColor: "text-tag-purple",
    backgroundColor: "bg-tag-purple/10",
    borderColor: "border-tag-purple/20",
    buttonColor: "text-tag-purple/50",
  },
  blue: {
    textColor: "text-tag-blue",
    backgroundColor: "bg-tag-blue/10",
    borderColor: "border-tag-blue/20",
    buttonColor: "text-tag-blue/50",
  },
  green: {
    textColor: "text-tag-green",
    backgroundColor: "bg-tag-green/10",
    borderColor: "border-tag-green/20",
    buttonColor: "text-tag-green/50",
  },
  orange: {
    textColor: "text-tag-orange",
    backgroundColor: "bg-tag-orange/10",
    borderColor: "border-tag-orange/20",
    buttonColor: "text-tag-orange/50",
  },
  pink: {
    textColor: "text-tag-pink",
    backgroundColor: "bg-tag-pink/10",
    borderColor: "border-tag-pink/20",
    buttonColor: "text-tag-pink/50",
  },
  red: {
    textColor: "text-tag-red",
    backgroundColor: "bg-tag-red/10",
    borderColor: "border-tag-red/20",
    buttonColor: "text-tag-red/50",
  },
  yellow: {
    textColor: "text-tag-yellow",
    backgroundColor: "bg-tag-yellow/10",
    borderColor: "border-tag-yellow/20",
    buttonColor: "text-tag-yellow/50",
  },
  gray: {
    textColor: "text-tag-gray",
    backgroundColor: "bg-tag-gray/10",
    borderColor: "border-tag-gray/20",
    buttonColor: "text-tag-gray/50",
  },
  cyan: {
    textColor: "text-tag-cyan",
    backgroundColor: "bg-tag-cyan/10",
    borderColor: "border-tag-cyan/20",
    buttonColor: "text-tag-cyan/50",
  },
  indigo: {
    textColor: "text-tag-indigo",
    backgroundColor: "bg-tag-indigo/10",
    borderColor: "border-tag-indigo/20",
    buttonColor: "text-tag-indigo/50",
  },
  violet: {
    textColor: "text-tag-violet",
    backgroundColor: "bg-tag-violet/10",
    borderColor: "border-tag-violet/20",
    buttonColor: "text-tag-violet/50",
  },
  magenta: {
    textColor: "text-tag-magenta",
    backgroundColor: "bg-tag-magenta/10",
    borderColor: "border-tag-magenta/20",
    buttonColor: "text-tag-magenta/50",
  },
  lime: {
    textColor: "text-tag-lime",
    backgroundColor: "bg-tag-lime/10",
    borderColor: "border-tag-lime/20",
    buttonColor: "text-tag-lime/50",
  },
  emerald: {
    textColor: "text-tag-emerald",
    backgroundColor: "bg-tag-emerald/10",
    borderColor: "border-tag-emerald/20",
    buttonColor: "text-tag-emerald/50",
  },
  rose: {
    textColor: "text-tag-rose",
    backgroundColor: "bg-tag-rose/10",
    borderColor: "border-tag-rose/20",
    buttonColor: "text-tag-rose/50",
  },
  brown: {
    textColor: "text-tag-brown",
    backgroundColor: "bg-tag-brown/10",
    borderColor: "border-tag-brown/20",
    buttonColor: "text-tag-brown/50",
  },
};

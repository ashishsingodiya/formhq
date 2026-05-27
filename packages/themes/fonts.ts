import type { FontKey } from "@repo/database/models/form";

export type FontCategory = "sans" | "serif" | "mono";

export type FontMeta = {
  name: string;
  category: FontCategory;
  cssVar: string;
};

export const FONTS: Record<FontKey, FontMeta> = {
  geist: { name: "Geist", category: "sans", cssVar: "--font-geist" },
  inter: { name: "Inter", category: "sans", cssVar: "--font-inter" },
  "dm-sans": { name: "DM Sans", category: "sans", cssVar: "--font-dm-sans" },
  "space-grotesk": { name: "Space Grotesk", category: "sans", cssVar: "--font-space-grotesk" },
  lora: { name: "Lora", category: "serif", cssVar: "--font-lora" },
  playfair: { name: "Playfair Display", category: "serif", cssVar: "--font-playfair" },
  "instrument-serif": {
    name: "Instrument Serif",
    category: "serif",
    cssVar: "--font-instrument-serif",
  },
  "jetbrains-mono": { name: "JetBrains Mono", category: "mono", cssVar: "--font-jetbrains-mono" },
};

export const FONT_KEYS = Object.keys(FONTS) as FontKey[];

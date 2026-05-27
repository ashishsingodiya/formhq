import type { ResolvedTheme, ThemePreset } from "@repo/database/models/form";

const baseTypography: ResolvedTheme["typography"] = {
  fontKey: "geist",
  fontSize: "base",
  headingWeight: "semibold",
};

const baseShape: ResolvedTheme["shape"] = {
  radius: "md",
  buttonStyle: "default",
};

const baseLayout: ResolvedTheme["layout"] = {
  density: "comfortable",
  alignment: "left",
};

const defaultPreset: ThemePreset = {
  id: "defaultPreset",
  name: "Default",
  theme: {
    colors: {
      background: "#fdfaf3",
      foreground: "#1c1917",
      primary: "#1c1917",
      primaryForeground: "#fdfaf3",
      accent: "#f5f1e8",
      muted: "#f5f1e8",
      border: "#e7e2d4",
      destructive: "#b91c1c",
    },
    background: { type: "solid", value: "#fdfaf3" },
    typography: { fontKey: "lora", fontSize: "base", headingWeight: "semibold" },
    shape: { radius: "sm", buttonStyle: "default" },
    layout: { ...baseLayout, alignment: "center" },
  },
};

const ocean: ThemePreset = {
  id: "ocean",
  name: "Ocean",
  theme: {
    colors: {
      background: "#0c4a6e",
      foreground: "#f0f9ff",
      primary: "#38bdf8",
      primaryForeground: "#0c4a6e",
      accent: "#075985",
      muted: "#0e7490",
      border: "#155e75",
      destructive: "#fb7185",
    },
    background: {
      type: "gradient",
      value: "linear-gradient(135deg, #0c4a6e 0%, #155e75 50%, #0e7490 100%)",
    },
    typography: { ...baseTypography, fontKey: "space-grotesk" },
    shape: { radius: "lg", buttonStyle: "rounded" },
    layout: baseLayout,
  },
};

const mono: ThemePreset = {
  id: "mono",
  name: "Mono",
  theme: {
    colors: {
      background: "#0a0a0a",
      foreground: "#22c55e",
      primary: "#22c55e",
      primaryForeground: "#0a0a0a",
      accent: "#171717",
      muted: "#171717",
      border: "#22c55e",
      destructive: "#f87171",
    },
    background: { type: "solid", value: "#0a0a0a" },
    typography: { fontKey: "jetbrains-mono", fontSize: "base", headingWeight: "medium" },
    shape: { radius: "none", buttonStyle: "sharp" },
    layout: baseLayout,
  },
};

const midnight: ThemePreset = {
  id: "midnight",
  name: "Midnight",
  theme: {
    colors: {
      background: "#020617",
      foreground: "#e2e8f0",
      primary: "#60a5fa",
      primaryForeground: "#020617",
      accent: "#0f172a",
      muted: "#0f172a",
      border: "#1e293b",
      destructive: "#f87171",
    },
    background: { type: "solid", value: "#020617" },
    typography: { ...baseTypography, fontKey: "inter" },
    shape: { radius: "md", buttonStyle: "default" },
    layout: baseLayout,
  },
};

const rose: ThemePreset = {
  id: "rose",
  name: "Rose",
  theme: {
    colors: {
      background: "#fff0f5",
      foreground: "#3d0a1e",
      primary: "#e11d48",
      primaryForeground: "#fff0f5",
      accent: "#ffe4ef",
      muted: "#ffd6e7",
      border: "#fba4c0",
      destructive: "#9f1239",
    },
    background: { type: "solid", value: "#fff0f5" },
    typography: { fontKey: "playfair", fontSize: "base", headingWeight: "bold" },
    shape: { radius: "full", buttonStyle: "pill" },
    layout: { ...baseLayout, alignment: "center" },
  },
};

const amber: ThemePreset = {
  id: "amber",
  name: "Amber",
  theme: {
    colors: {
      background: "#fffbeb",
      foreground: "#451a03",
      primary: "#d97706",
      primaryForeground: "#fffbeb",
      accent: "#fef3c7",
      muted: "#fde68a",
      border: "#fcd34d",
      destructive: "#b91c1c",
    },
    background: { type: "solid", value: "#fffbeb" },
    typography: { fontKey: "dm-sans", fontSize: "base", headingWeight: "semibold" },
    shape: { radius: "sm", buttonStyle: "default" },
    layout: baseLayout,
  },
};

const slate: ThemePreset = {
  id: "slate",
  name: "Slate",
  theme: {
    colors: {
      background: "#f8fafc",
      foreground: "#0f172a",
      primary: "#475569",
      primaryForeground: "#f8fafc",
      accent: "#f1f5f9",
      muted: "#e2e8f0",
      border: "#cbd5e1",
      destructive: "#b91c1c",
    },
    background: { type: "solid", value: "#f8fafc" },
    typography: { ...baseTypography, fontKey: "inter" },
    shape: { radius: "md", buttonStyle: "default" },
    layout: baseLayout,
  },
};

const crimson: ThemePreset = {
  id: "crimson",
  name: "Crimson",
  theme: {
    colors: {
      background: "#0c0505",
      foreground: "#fef2f2",
      primary: "#ef4444",
      primaryForeground: "#0c0505",
      accent: "#1c0a0a",
      muted: "#1c0a0a",
      border: "#7f1d1d",
      destructive: "#fca5a5",
    },
    background: { type: "solid", value: "#0c0505" },
    typography: { ...baseTypography, fontKey: "space-grotesk" },
    shape: { radius: "none", buttonStyle: "sharp" },
    layout: baseLayout,
  },
};

const aurora: ThemePreset = {
  id: "aurora",
  name: "Aurora",
  theme: {
    colors: {
      background: "#022c22",
      foreground: "#f0fdf4",
      primary: "#34d399",
      primaryForeground: "#022c22",
      accent: "rgba(52,211,153,0.15)",
      muted: "rgba(255,255,255,0.08)",
      border: "rgba(52,211,153,0.3)",
      destructive: "#fca5a5",
    },
    background: {
      type: "gradient",
      value: "linear-gradient(160deg, #022c22 0%, #064e3b 30%, #312e81 70%, #1e1b4b 100%)",
    },
    typography: { ...baseTypography, fontKey: "dm-sans" },
    shape: { radius: "lg", buttonStyle: "rounded" },
    layout: baseLayout,
  },
};

const lavender: ThemePreset = {
  id: "lavender",
  name: "Lavender",
  theme: {
    colors: {
      background: "#faf5ff",
      foreground: "#2e1065",
      primary: "#7c3aed",
      primaryForeground: "#faf5ff",
      accent: "#ede9fe",
      muted: "#ddd6fe",
      border: "#c4b5fd",
      destructive: "#b91c1c",
    },
    background: {
      type: "gradient",
      value: "linear-gradient(135deg, #faf5ff 0%, #ede9fe 50%, #ddd6fe 100%)",
    },
    typography: { fontKey: "instrument-serif", fontSize: "base", headingWeight: "normal" },
    shape: { radius: "lg", buttonStyle: "pill" },
    layout: { ...baseLayout, alignment: "center" },
  },
};

const mountain: ThemePreset = {
  id: "mountain",
  name: "Mountain",
  theme: {
    colors: {
      background: "#1a1520",
      foreground: "#ffffff",
      primary: "#ffb085",
      primaryForeground: "#1a0800",
      accent: "rgba(255,255,255,0.15)",
      muted: "rgba(255,255,255,0.1)",
      border: "rgba(255,176,133,0.35)",
      destructive: "#ff6b6b",
    },
    background: {
      type: "image",
      value: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80&fit=crop",
      overlay: 0.45,
      blur: 0,
    },
    typography: { fontKey: "playfair", fontSize: "base", headingWeight: "bold" },
    shape: { radius: "md", buttonStyle: "default" },
    layout: { density: "comfortable", alignment: "left" },
  },
};

// Forest: dark misty forest — deep blue-black, teal-green mist, bright green light patches
// With 0.5 overlay → very dark. White text, bright mint-green accent.
const forest: ThemePreset = {
  id: "forest",
  name: "Forest",
  theme: {
    colors: {
      background: "#071a0f",
      foreground: "#f0fff4",
      primary: "#6ee7a0",
      primaryForeground: "#052e16",
      accent: "rgba(110,231,160,0.15)",
      muted: "rgba(255,255,255,0.08)",
      border: "rgba(110,231,160,0.28)",
      destructive: "#fca5a5",
    },
    background: {
      type: "image",
      value: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80&fit=crop",
      overlay: 0.5,
      blur: 0,
    },
    typography: { fontKey: "lora", fontSize: "base", headingWeight: "semibold" },
    shape: { radius: "sm", buttonStyle: "default" },
    layout: { density: "comfortable", alignment: "left" },
  },
};

// Cosmos: night sky with Milky Way — deep navy, purple-pink galaxy, blue gradient
// With 0.35 overlay → moderately dark. White text, soft lavender accent.
const cosmos: ThemePreset = {
  id: "cosmos",
  name: "Cosmos",
  theme: {
    colors: {
      background: "#0d0b1e",
      foreground: "#f8fafc",
      primary: "#d8b4fe",
      primaryForeground: "#1e0a3c",
      accent: "rgba(216,180,254,0.18)",
      muted: "rgba(255,255,255,0.08)",
      border: "rgba(216,180,254,0.3)",
      destructive: "#fca5a5",
    },
    background: {
      type: "image",
      value: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80&fit=crop",
      overlay: 0.35,
      blur: 0,
    },
    typography: { fontKey: "space-grotesk", fontSize: "base", headingWeight: "semibold" },
    shape: { radius: "lg", buttonStyle: "rounded" },
    layout: { density: "comfortable", alignment: "center" },
  },
};

// Blossom: cherry blossoms — soft pink (#f4c2c2), light blue sky (#b8e0e8)
// Light image → very light overlay, dark deep-rose text for contrast.
const blossom: ThemePreset = {
  id: "blossom",
  name: "Blossom",
  theme: {
    colors: {
      background: "#fff0f5",
      foreground: "#3d0a1e",
      primary: "#be185d",
      primaryForeground: "#fff0f5",
      accent: "rgba(255,255,255,0.55)",
      muted: "rgba(255,255,255,0.45)",
      border: "rgba(190,24,93,0.25)",
      destructive: "#9f1239",
    },
    background: {
      type: "image",
      value: "https://images.unsplash.com/photo-1522383225653-ed111181a951?w=1920&q=80&fit=crop",
      overlay: 0.12,
      blur: 0,
    },
    typography: { fontKey: "instrument-serif", fontSize: "base", headingWeight: "normal" },
    shape: { radius: "full", buttonStyle: "pill" },
    layout: { density: "comfortable", alignment: "center" },
  },
};

// Winter: snowy misty forest — white snow, dark teal-grey trees, grey fog
// Light image → light overlay, dark forest-green text for contrast.
const winter: ThemePreset = {
  id: "winter",
  name: "Winter",
  theme: {
    colors: {
      background: "#f0f4f5",
      foreground: "#1a2e2a",
      primary: "#2d6a4f",
      primaryForeground: "#f0fdf4",
      accent: "rgba(255,255,255,0.6)",
      muted: "rgba(255,255,255,0.5)",
      border: "rgba(45,106,79,0.28)",
      destructive: "#b91c1c",
    },
    background: {
      type: "image",
      value: "https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=1920&q=80&fit=crop",
      overlay: 0.18,
      blur: 0,
    },
    typography: { ...baseTypography, fontKey: "inter" },
    shape: { radius: "sm", buttonStyle: "default" },
    layout: baseLayout,
  },
};

const beach: ThemePreset = {
  id: "beach",
  name: "Beach",
  theme: {
    colors: {
      background: "#f0fdff",
      foreground: "#0c2a35",
      primary: "#0891b2",
      primaryForeground: "#f0fdff",
      accent: "rgba(255,255,255,0.5)",
      muted: "rgba(255,255,255,0.4)",
      border: "rgba(8,145,178,0.3)",
      destructive: "#b91c1c",
    },
    background: {
      type: "image",
      value: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80&fit=crop",
      overlay: 0.22,
      blur: 0,
    },
    typography: { fontKey: "dm-sans", fontSize: "base", headingWeight: "semibold" },
    shape: { radius: "lg", buttonStyle: "rounded" },
    layout: { density: "comfortable", alignment: "center" },
  },
};

// Desert: Monument Valley — warm orange-red rock (#c1440e), blue sky
// Medium brightness → moderate overlay, white text, warm orange accent.
const desert: ThemePreset = {
  id: "desert",
  name: "Desert",
  theme: {
    colors: {
      background: "#1c0a00",
      foreground: "#fff7ed",
      primary: "#fb923c",
      primaryForeground: "#431407",
      accent: "rgba(255,255,255,0.15)",
      muted: "rgba(255,255,255,0.1)",
      border: "rgba(251,146,60,0.35)",
      destructive: "#fca5a5",
    },
    background: {
      type: "image",
      value: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1920&q=80&fit=crop",
      overlay: 0.38,
      blur: 0,
    },
    typography: { fontKey: "space-grotesk", fontSize: "base", headingWeight: "semibold" },
    shape: { radius: "sm", buttonStyle: "default" },
    layout: baseLayout,
  },
};

export const PRESETS: ThemePreset[] = [
  defaultPreset,
  ocean,
  mono,
  midnight,
  rose,
  amber,
  slate,
  crimson,
  aurora,
  lavender,
  mountain,
  forest,
  cosmos,
  blossom,
  winter,
  beach,
  desert,
];

const PRESETS_BY_ID = new Map(PRESETS.map((p) => [p.id, p]));

export function getPreset(id: string): ThemePreset {
  return PRESETS_BY_ID.get(id) ?? defaultPreset;
}

export const DEFAULT_PRESET_ID = "default";

import type { ResolvedTheme } from "@repo/database/models/form";
import { FONTS } from "./fonts";

const FONT_SIZE_PX: Record<ResolvedTheme["typography"]["fontSize"], string> = {
  sm: "14px",
  base: "16px",
  lg: "18px",
};

const HEADING_WEIGHT: Record<ResolvedTheme["typography"]["headingWeight"], string> = {
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
};

const RADIUS_PX: Record<ResolvedTheme["shape"]["radius"], string> = {
  none: "0px",
  sm: "4px",
  md: "8px",
  lg: "16px",
  full: "9999px",
};

const SPACING_GAP: Record<ResolvedTheme["layout"]["density"], string> = {
  compact: "16px",
  comfortable: "24px",
};

export function themeToCssVars(theme: ResolvedTheme): Record<string, string> {
  const vars: Record<string, string> = {
    "--theme-bg": theme.colors.background,
    "--theme-fg": theme.colors.foreground,
    "--theme-primary": theme.colors.primary,
    "--theme-primary-fg": theme.colors.primaryForeground,
    "--theme-accent": theme.colors.accent,
    "--theme-muted": theme.colors.muted,
    "--theme-border": theme.colors.border,
    "--theme-destructive": theme.colors.destructive,

    "--theme-font": `var(${FONTS[theme.typography.fontKey].cssVar})`,
    "--theme-font-size": FONT_SIZE_PX[theme.typography.fontSize],
    "--theme-heading-weight": HEADING_WEIGHT[theme.typography.headingWeight],

    "--theme-radius": RADIUS_PX[theme.shape.radius],
    "--theme-button-radius": buttonRadius(theme.shape.buttonStyle, theme.shape.radius),

    "--theme-gap": SPACING_GAP[theme.layout.density],
    "--theme-align": theme.layout.alignment,
  };

  switch (theme.background.type) {
    case "solid":
      vars["--theme-page-bg"] = theme.background.value;
      break;
    case "gradient":
      vars["--theme-page-bg"] = theme.background.value;
      break;
    case "image":
      vars["--theme-page-bg"] = `url("${theme.background.value}") center/cover no-repeat`;
      vars["--theme-page-overlay"] = String(theme.background.overlay ?? 0.4);
      vars["--theme-page-blur"] = `${theme.background.blur ?? 0}px`;
      break;
  }

  return vars;
}

function buttonRadius(
  style: ResolvedTheme["shape"]["buttonStyle"],
  globalRadius: ResolvedTheme["shape"]["radius"],
): string {
  switch (style) {
    case "default":
      return RADIUS_PX[globalRadius];
    case "rounded":
      return RADIUS_PX.lg;
    case "sharp":
      return RADIUS_PX.none;
    case "pill":
      return RADIUS_PX.full;
  }
}

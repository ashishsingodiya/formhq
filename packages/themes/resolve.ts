import type { ResolvedTheme, ThemeConfig, ThemeOverrides } from "@repo/database/models/form";
import { getPreset } from "./presets";

export function resolveTheme(config: ThemeConfig): ResolvedTheme {
  const preset = getPreset(config.presetId);
  if (!config.overrides) return preset.theme;
  return mergeTheme(preset.theme, config.overrides);
}

function mergeTheme(base: ResolvedTheme, overrides: ThemeOverrides): ResolvedTheme {
  return {
    colors: { ...base.colors, ...(overrides.colors ?? {}) },
    background: overrides.background ?? base.background,
    typography: { ...base.typography, ...(overrides.typography ?? {}) },
    shape: { ...base.shape, ...(overrides.shape ?? {}) },
    layout: { ...base.layout, ...(overrides.layout ?? {}) },
  };
}

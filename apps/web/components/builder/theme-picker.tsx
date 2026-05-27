"use client";

import { Check, Palette } from "lucide-react";
import { PRESETS, getPreset, type ThemeConfig } from "@repo/themes";
import { Button } from "~/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { cn } from "~/lib/utils";

export function ThemePicker({
  value,
  onChange,
  disabled,
}: {
  value: ThemeConfig;
  onChange: (next: ThemeConfig) => void;
  disabled?: boolean;
}) {
  const activePreset = getPreset(value.presetId);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
          <Palette />
          {activePreset.name}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-2">
        <p className="px-2 py-1.5 text-xs uppercase tracking-wide text-muted-foreground font-medium">
          Theme
        </p>
        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map((preset) => {
            const isActive = preset.id === value.presetId;
            return (
              <button
                key={preset.id}
                onClick={() => onChange({ ...value, presetId: preset.id })}
                className={cn(
                  "border rounded-md p-2 text-left transition-colors",
                  isActive ? "border-foreground" : "hover:border-muted-foreground",
                )}
              >
                <ThemeSwatch theme={preset.theme} />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs font-medium">{preset.name}</span>
                  {isActive && <Check className="size-3" />}
                </div>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Tiny preview tile: shows page background, primary color, and accent
// stripes. Uses the resolved theme's actual values.
function ThemeSwatch({ theme }: { theme: ReturnType<typeof getPreset>["theme"] }) {
  const bg =
    theme.background.type === "solid"
      ? theme.background.value
      : theme.background.type === "gradient"
        ? theme.background.value
        : theme.colors.background;

  return (
    <div
      className="h-12 rounded border"
      style={{ background: bg, borderColor: theme.colors.border }}
    >
      <div className="h-full flex items-center gap-1 px-2">
        <div className="size-2.5 rounded-full" style={{ background: theme.colors.primary }} />
        <div
          className="h-1 flex-1 rounded"
          style={{ background: theme.colors.foreground, opacity: 0.4 }}
        />
        <div className="h-1 w-3 rounded" style={{ background: theme.colors.accent }} />
      </div>
    </div>
  );
}

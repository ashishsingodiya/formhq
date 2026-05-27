"use client";

import { resolveTheme, FONTS, type FontKey, type ThemeConfig } from "@repo/themes";
import { RotateCcw } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useDebouncedCallback } from "~/lib/use-debounced-callback";

const COLOR_FIELDS: Array<{ key: ColorKey; label: string }> = [
  { key: "background", label: "Background" },
  { key: "foreground", label: "Text" },
  { key: "primary", label: "Primary" },
  { key: "primaryForeground", label: "Primary text" },
  { key: "accent", label: "Accent" },
  { key: "border", label: "Border" },
];

type ColorKey =
  | "background"
  | "foreground"
  | "primary"
  | "primaryForeground"
  | "accent"
  | "muted"
  | "border"
  | "destructive";

export function ThemeCustomizer({
  config,
  onChange,
}: {
  config: ThemeConfig;
  onChange: (next: ThemeConfig) => void;
}) {
  const resolved = resolveTheme(config);
  const overrides = config.overrides ?? {};

  const debouncedColor = useDebouncedCallback((key: ColorKey, value: string) => {
    onChange({
      ...config,
      overrides: {
        ...overrides,
        colors: { ...(overrides.colors ?? {}), [key]: value },
      },
    });
  }, 300);

  const setTypography = (patch: Partial<NonNullable<typeof overrides.typography>>) => {
    onChange({
      ...config,
      overrides: {
        ...overrides,
        typography: { ...(overrides.typography ?? {}), ...patch },
      },
    });
  };

  const setShape = (patch: Partial<NonNullable<typeof overrides.shape>>) => {
    onChange({
      ...config,
      overrides: { ...overrides, shape: { ...(overrides.shape ?? {}), ...patch } },
    });
  };

  const setLayout = (patch: Partial<NonNullable<typeof overrides.layout>>) => {
    onChange({
      ...config,
      overrides: {
        ...overrides,
        layout: { ...(overrides.layout ?? {}), ...patch },
      },
    });
  };

  const resetSection = (section: "colors" | "typography" | "shape" | "layout") => {
    const next = { ...overrides };
    delete next[section];
    onChange({ ...config, overrides: next });
  };

  return (
    <div className="p-4 flex flex-col gap-6">
      <div>
        <h3 className="text-xs uppercase tracking-wide text-muted-foreground font-medium mb-1">
          Customize
        </h3>
        <p className="text-xs text-muted-foreground">
          Layered on top of the &quot;{config.presetId}&quot; preset.
        </p>
      </div>

      {/* Colors */}
      <Section title="Colors" onReset={overrides.colors ? () => resetSection("colors") : undefined}>
        <div className="flex flex-col gap-2">
          {COLOR_FIELDS.map(({ key, label }) => {
            const current = overrides.colors?.[key] ?? resolved.colors[key];
            return (
              <div key={key} className="flex items-center gap-2">
                <Label className="text-xs flex-1 min-w-0">{label}</Label>
                <input
                  type="color"
                  value={toHex(current)}
                  onChange={(e) => debouncedColor(key, e.target.value)}
                  className="size-7 rounded border cursor-pointer"
                  aria-label={`${label} color`}
                />
                <Input
                  value={current}
                  onChange={(e) => debouncedColor(key, e.target.value)}
                  className="w-24 h-7 font-mono text-xs"
                />
              </div>
            );
          })}
        </div>
      </Section>

      {/* Typography */}
      <Section
        title="Typography"
        onReset={overrides.typography ? () => resetSection("typography") : undefined}
      >
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Font</Label>
            <Select
              value={overrides.typography?.fontKey ?? resolved.typography.fontKey}
              onValueChange={(v) => setTypography({ fontKey: v as FontKey })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(FONTS).map(([key, meta]) => (
                  <SelectItem key={key} value={key}>
                    <span style={{ fontFamily: `var(${meta.cssVar})` }}>{meta.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Size</Label>
            <Select
              value={overrides.typography?.fontSize ?? resolved.typography.fontSize}
              onValueChange={(v) => setTypography({ fontSize: v as "sm" | "base" | "lg" })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sm">Small</SelectItem>
                <SelectItem value="base">Default</SelectItem>
                <SelectItem value="lg">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Heading weight</Label>
            <Select
              value={overrides.typography?.headingWeight ?? resolved.typography.headingWeight}
              onValueChange={(v) =>
                setTypography({
                  headingWeight: v as "normal" | "medium" | "semibold" | "bold",
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="semibold">Semibold</SelectItem>
                <SelectItem value="bold">Bold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Section>

      {/* Shape */}
      <Section title="Shape" onReset={overrides.shape ? () => resetSection("shape") : undefined}>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Corner radius</Label>
            <Select
              value={overrides.shape?.radius ?? resolved.shape.radius}
              onValueChange={(v) => setShape({ radius: v as "none" | "sm" | "md" | "lg" | "full" })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="sm">Small</SelectItem>
                <SelectItem value="md">Medium</SelectItem>
                <SelectItem value="lg">Large</SelectItem>
                <SelectItem value="full">Full</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Buttons</Label>
            <Select
              value={overrides.shape?.buttonStyle ?? resolved.shape.buttonStyle}
              onValueChange={(v) =>
                setShape({
                  buttonStyle: v as "default" | "rounded" | "sharp" | "pill",
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Match radius</SelectItem>
                <SelectItem value="rounded">Rounded</SelectItem>
                <SelectItem value="sharp">Sharp</SelectItem>
                <SelectItem value="pill">Pill</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Section>

      {/* Layout */}
      <Section title="Layout" onReset={overrides.layout ? () => resetSection("layout") : undefined}>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Density</Label>
            <Select
              value={overrides.layout?.density ?? resolved.layout.density}
              onValueChange={(v) => setLayout({ density: v as "compact" | "comfortable" })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">Compact</SelectItem>
                <SelectItem value="comfortable">Comfortable</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Alignment</Label>
            <Select
              value={overrides.layout?.alignment ?? resolved.layout.alignment}
              onValueChange={(v) => setLayout({ alignment: v as "left" | "center" })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  onReset,
  children,
}: {
  title: string;
  onReset?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">{title}</Label>
        {onReset && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onReset}
            aria-label={`Reset ${title}`}
            className="text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="size-3.5" />
          </Button>
        )}
      </div>
      {children}
    </div>
  );
}

function toHex(value: string): string {
  if (/^#[0-9a-fA-F]{6}$/.test(value)) return value;
  if (/^#[0-9a-fA-F]{3}$/.test(value)) {
    const r = value[1]!,
      g = value[2]!,
      b = value[3]!;
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return "#000000";
}

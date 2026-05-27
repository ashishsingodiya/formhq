"use client";

import {
  FONTS,
  PRESETS,
  getPreset,
  resolveTheme,
  type FontKey,
  type ThemeConfig,
} from "@repo/themes";
import { Check, RotateCcw } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useDebouncedCallback } from "~/lib/use-debounced-callback";
import { cn } from "~/lib/utils";

export function ThemeModal({
  open,
  onOpenChange,
  config,
  onChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: ThemeConfig;
  onChange: (next: ThemeConfig) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-3xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Theme</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="gallery" className="flex flex-col">
          <TabsList className="mx-6 mt-4 w-fit">
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="customize">Customize</TabsTrigger>
          </TabsList>

          <TabsContent value="gallery" className="px-6 pb-6 mt-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[60vh] overflow-auto pr-1">
              {PRESETS.map((preset) => {
                const isActive = preset.id === config.presetId;
                return (
                  <button
                    key={preset.id}
                    onClick={() => onChange({ ...config, presetId: preset.id })}
                    className={cn(
                      "border rounded-xl overflow-hidden text-left transition-all",
                      isActive
                        ? "border-foreground ring-2 ring-foreground ring-offset-2"
                        : "hover:border-muted-foreground",
                    )}
                  >
                    {/* Mini preview */}
                    <PresetCard theme={preset.theme} />
                    <div className="px-3 py-2 flex items-center justify-between border-t">
                      <span className="text-sm font-medium">{preset.name}</span>
                      {isActive && <Check className="size-4" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="customize" className="px-6 pb-6 mt-4 max-h-[60vh] overflow-auto">
            <ThemeCustomizePanel config={config} onChange={onChange} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function PresetCard({ theme }: { theme: ReturnType<typeof getPreset>["theme"] }) {
  const isImage = theme.background.type === "image";
  const bg =
    theme.background.type === "solid"
      ? theme.background.value
      : theme.background.type === "gradient"
        ? theme.background.value
        : undefined;

  return (
    <div
      className="h-36 p-4 flex flex-col justify-between relative overflow-hidden"
      style={
        isImage
          ? {
              backgroundImage: `url(${theme.background.value})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : { background: bg }
      }
    >
      {isImage && (theme.background as { overlay?: number }).overlay != null && (
        <div
          className="absolute inset-0"
          style={{
            background: `rgba(0,0,0,${(theme.background as { overlay?: number }).overlay})`,
          }}
        />
      )}
      <div className="relative z-10">
        <p
          className="text-sm font-semibold"
          style={{
            color: theme.colors.foreground,
            fontFamily: `var(${FONTS[theme.typography.fontKey as FontKey]?.cssVar ?? "--font-geist"})`,
          }}
        >
          Question
        </p>
        <p className="text-xs mt-0.5" style={{ color: theme.colors.primary }}>
          Answer
        </p>
      </div>
      <div
        className="relative z-10 h-6 w-12"
        style={{
          background: theme.colors.primary,
          borderRadius:
            theme.shape.radius === "full"
              ? 9999
              : theme.shape.radius === "lg"
                ? 8
                : theme.shape.radius === "md"
                  ? 6
                  : theme.shape.radius === "sm"
                    ? 4
                    : 0,
        }}
      />
    </div>
  );
}

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

function ThemeCustomizePanel({
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

  const setTypography = (patch: Partial<NonNullable<typeof overrides.typography>>) =>
    onChange({
      ...config,
      overrides: { ...overrides, typography: { ...(overrides.typography ?? {}), ...patch } },
    });

  const setShape = (patch: Partial<NonNullable<typeof overrides.shape>>) =>
    onChange({
      ...config,
      overrides: { ...overrides, shape: { ...(overrides.shape ?? {}), ...patch } },
    });

  const setLayout = (patch: Partial<NonNullable<typeof overrides.layout>>) =>
    onChange({
      ...config,
      overrides: { ...overrides, layout: { ...(overrides.layout ?? {}), ...patch } },
    });

  const resetSection = (section: "colors" | "typography" | "shape" | "layout") => {
    const next = { ...overrides };
    delete next[section];
    onChange({ ...config, overrides: next });
  };

  return (
    <div className="grid grid-cols-2 gap-8">
      {/* Colors */}
      <CustomizeSection
        title="Colors"
        onReset={overrides.colors ? () => resetSection("colors") : undefined}
      >
        <div className="flex flex-col gap-2">
          {COLOR_FIELDS.map(({ key, label }) => {
            const current = overrides.colors?.[key] ?? resolved.colors[key];
            return (
              <div key={key} className="flex items-center gap-2">
                <Label className="text-xs flex-1">{label}</Label>
                <input
                  type="color"
                  value={toHex(current)}
                  onChange={(e) => debouncedColor(key, e.target.value)}
                  className="size-7 rounded border cursor-pointer shrink-0"
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
      </CustomizeSection>

      <div className="flex flex-col gap-6">
        {/* Typography */}
        <CustomizeSection
          title="Typography"
          onReset={overrides.typography ? () => resetSection("typography") : undefined}
        >
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <Label className="text-xs">Font</Label>
              <Select
                value={overrides.typography?.fontKey ?? resolved.typography.fontKey}
                onValueChange={(v) => setTypography({ fontKey: v as FontKey })}
              >
                <SelectTrigger className="h-8 text-xs">
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
            <div className="flex gap-2">
              <div className="flex flex-col gap-1 flex-1">
                <Label className="text-xs">Size</Label>
                <Select
                  value={overrides.typography?.fontSize ?? resolved.typography.fontSize}
                  onValueChange={(v) => setTypography({ fontSize: v as "sm" | "base" | "lg" })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sm">Small</SelectItem>
                    <SelectItem value="base">Default</SelectItem>
                    <SelectItem value="lg">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <Label className="text-xs">Weight</Label>
                <Select
                  value={overrides.typography?.headingWeight ?? resolved.typography.headingWeight}
                  onValueChange={(v) =>
                    setTypography({ headingWeight: v as "normal" | "medium" | "semibold" | "bold" })
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
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
          </div>
        </CustomizeSection>

        {/* Shape */}
        <CustomizeSection
          title="Shape"
          onReset={overrides.shape ? () => resetSection("shape") : undefined}
        >
          <div className="flex gap-2">
            <div className="flex flex-col gap-1 flex-1">
              <Label className="text-xs">Radius</Label>
              <Select
                value={overrides.shape?.radius ?? resolved.shape.radius}
                onValueChange={(v) =>
                  setShape({ radius: v as "none" | "sm" | "md" | "lg" | "full" })
                }
              >
                <SelectTrigger className="h-8 text-xs">
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
            <div className="flex flex-col gap-1 flex-1">
              <Label className="text-xs">Buttons</Label>
              <Select
                value={overrides.shape?.buttonStyle ?? resolved.shape.buttonStyle}
                onValueChange={(v) =>
                  setShape({ buttonStyle: v as "default" | "rounded" | "sharp" | "pill" })
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Match</SelectItem>
                  <SelectItem value="rounded">Rounded</SelectItem>
                  <SelectItem value="sharp">Sharp</SelectItem>
                  <SelectItem value="pill">Pill</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CustomizeSection>

        {/* Layout */}
        <CustomizeSection
          title="Layout"
          onReset={overrides.layout ? () => resetSection("layout") : undefined}
        >
          <div className="flex gap-2">
            <div className="flex flex-col gap-1 flex-1">
              <Label className="text-xs">Density</Label>
              <Select
                value={overrides.layout?.density ?? resolved.layout.density}
                onValueChange={(v) => setLayout({ density: v as "compact" | "comfortable" })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="comfortable">Comfortable</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <Label className="text-xs">Align</Label>
              <Select
                value={overrides.layout?.alignment ?? resolved.layout.alignment}
                onValueChange={(v) => setLayout({ alignment: v as "left" | "center" })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CustomizeSection>
      </div>
    </div>
  );
}

function CustomizeSection({
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
    const [, r, g, b] = value;
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return "#000000";
}

"use client";

import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { FIELD_TYPES, TYPE_LABELS, type FieldType } from "~/lib/field-types";
import { useDebouncedCallback } from "~/lib/use-debounced-callback";
import { type FieldConfig } from "~/lib/field-config";

export type SidebarField = {
  id: string;
  type: string;
  isRequired: boolean;
  config: FieldConfig;
};

export function FieldSidebar({
  field,
  onTypeChange,
  onRequiredChange,
  onConfigChange,
}: {
  field: SidebarField;
  onTypeChange: (type: FieldType) => void;
  onRequiredChange: (required: boolean) => void;
  onConfigChange: (config: FieldConfig) => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-4 border-b flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">Answer</Label>
          <Select value={field.type} onValueChange={(v) => onTypeChange(v as FieldType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FIELD_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {TYPE_LABELS[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 py-4 flex flex-col gap-4">
        <SettingRow label="Required">
          <Switch checked={field.isRequired} onCheckedChange={onRequiredChange} />
        </SettingRow>

        <TypeSettings field={field} onConfigChange={onConfigChange} />
      </div>
    </div>
  );
}

function TypeSettings({
  field,
  onConfigChange,
}: {
  field: SidebarField;
  onConfigChange: (config: FieldConfig) => void;
}) {
  const cfg = field.config;

  const debouncedUpdate = useDebouncedCallback((patch: Record<string, unknown>) =>
    onConfigChange({ ...cfg, ...patch }),
  );

  switch (field.type as FieldType) {
    case "SHORT_TEXT":
      return (
        <>
          <NumSetting
            label="Min length"
            value={cfg.minLength as number | undefined}
            onChange={(v) => debouncedUpdate({ minLength: v })}
          />
          <NumSetting
            label="Max length"
            value={cfg.maxLength as number | undefined}
            onChange={(v) => debouncedUpdate({ maxLength: v })}
          />
          <TextSetting
            label="Regex pattern"
            value={cfg.regex as string | undefined}
            placeholder="^[A-Z]+$"
            onChange={(v) => debouncedUpdate({ regex: v })}
          />
          <TextSetting
            label="Regex error"
            value={cfg.regexMessage as string | undefined}
            placeholder="Must be uppercase"
            onChange={(v) => debouncedUpdate({ regexMessage: v })}
          />
        </>
      );

    case "LONG_TEXT":
      return (
        <>
          <NumSetting
            label="Min length"
            value={cfg.minLength as number | undefined}
            onChange={(v) => debouncedUpdate({ minLength: v })}
          />
          <NumSetting
            label="Max length"
            value={cfg.maxLength as number | undefined}
            onChange={(v) => debouncedUpdate({ maxLength: v })}
          />
        </>
      );

    case "EMAIL":
      return (
        <p className="text-xs text-muted-foreground">Email format is validated automatically.</p>
      );

    case "NUMBER":
      return (
        <>
          <NumSetting
            label="Min"
            value={cfg.min as number | undefined}
            onChange={(v) => debouncedUpdate({ min: v })}
            step="any"
          />
          <NumSetting
            label="Max"
            value={cfg.max as number | undefined}
            onChange={(v) => debouncedUpdate({ max: v })}
            step="any"
          />
          <SettingRow label="Integers only">
            <Switch
              checked={!!cfg.integer}
              onCheckedChange={(v) => onConfigChange({ ...cfg, integer: v })}
            />
          </SettingRow>
        </>
      );

    case "SINGLE_SELECT":
      return (
        <SelectSetting
          label="Display as"
          value={(cfg.display as string | undefined) ?? "radio"}
          options={[
            { value: "radio", label: "Radio" },
            { value: "dropdown", label: "Dropdown" },
          ]}
          onChange={(v) => onConfigChange({ ...cfg, display: v })}
        />
      );

    case "MULTI_SELECT":
      return (
        <>
          <SelectSetting
            label="Display as"
            value={(cfg.display as string | undefined) ?? "checkbox"}
            options={[
              { value: "checkbox", label: "Checkbox" },
              { value: "tags", label: "Tags" },
            ]}
            onChange={(v) => onConfigChange({ ...cfg, display: v })}
          />
          <NumSetting
            label="Min selected"
            value={cfg.minSelected as number | undefined}
            onChange={(v) => debouncedUpdate({ minSelected: v })}
          />
          <NumSetting
            label="Max selected"
            value={cfg.maxSelected as number | undefined}
            onChange={(v) => debouncedUpdate({ maxSelected: v })}
          />
        </>
      );

    case "RATING":
      return (
        <>
          <NumSetting
            label="Max rating (2–10)"
            value={(cfg.max as number | undefined) ?? 5}
            onChange={(v) => onConfigChange({ ...cfg, max: v ?? 5 })}
            min={2}
            max={10}
          />
          <SelectSetting
            label="Icon"
            value={(cfg.icon as string | undefined) ?? "star"}
            options={[
              { value: "star", label: "Star" },
              { value: "heart", label: "Heart" },
              { value: "thumb", label: "Thumb" },
            ]}
            onChange={(v) => onConfigChange({ ...cfg, icon: v })}
          />
        </>
      );

    case "DATE":
      return (
        <>
          <DateSetting
            label="Earliest date"
            value={cfg.minDate as string | undefined}
            onChange={(v) => onConfigChange({ ...cfg, minDate: v })}
          />
          <DateSetting
            label="Latest date"
            value={cfg.maxDate as string | undefined}
            onChange={(v) => onConfigChange({ ...cfg, maxDate: v })}
          />
        </>
      );

    case "YES_NO":
      return (
        <>
          <TextSetting
            label="Yes label"
            value={cfg.yesLabel as string | undefined}
            placeholder="Yes"
            onChange={(v) => debouncedUpdate({ yesLabel: v })}
          />
          <TextSetting
            label="No label"
            value={cfg.noLabel as string | undefined}
            placeholder="No"
            onChange={(v) => debouncedUpdate({ noLabel: v })}
          />
        </>
      );

    default:
      return null;
  }
}

// ── Reusable setting rows ────────────────────────────────────────────────────
function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label className="text-sm">{label}</Label>
      {children}
    </div>
  );
}

function NumSetting({
  label,
  value,
  onChange,
  step,
  min,
  max,
}: {
  label: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  step?: number | "any";
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm">{label}</Label>
      <Input
        type="number"
        step={step}
        min={min}
        max={max}
        value={value ?? ""}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === "") return onChange(undefined);
          const n = Number(raw);
          if (Number.isFinite(n)) onChange(n);
        }}
        className="h-8"
      />
    </div>
  );
}

function TextSetting({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string | undefined;
  placeholder?: string;
  onChange: (v: string | undefined) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm">{label}</Label>
      <Input
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value || undefined)}
        className="h-8"
      />
    </div>
  );
}

function DateSetting({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | undefined;
  onChange: (v: string | undefined) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm">{label}</Label>
      <Input
        type="date"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || undefined)}
        className="h-8"
      />
    </div>
  );
}

function SelectSetting({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

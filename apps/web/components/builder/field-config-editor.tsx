"use client";

import { Plus, Trash2 } from "lucide-react";
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
import { Switch } from "~/components/ui/switch";

type FieldOption = { value: string; label: string };

export type FieldConfig =
  | {
      type: "SHORT_TEXT";
      minLength?: number;
      maxLength?: number;
      regex?: string;
      regexMessage?: string;
    }
  | { type: "LONG_TEXT"; minLength?: number; maxLength?: number }
  | { type: "EMAIL" }
  | { type: "NUMBER"; min?: number; max?: number; integer?: boolean }
  | {
      type: "SINGLE_SELECT";
      options: FieldOption[];
      display?: "dropdown" | "radio";
    }
  | {
      type: "MULTI_SELECT";
      options: FieldOption[];
      minSelected?: number;
      maxSelected?: number;
      display?: "checkbox" | "tags";
    }
  | { type: "RATING"; max?: number; icon?: "star" | "heart" | "thumb" }
  | { type: "DATE"; minDate?: string; maxDate?: string }
  | { type: "YES_NO"; yesLabel?: string; noLabel?: string };

export function FieldConfigEditor({
  config,
  onChange,
}: {
  config: FieldConfig;
  onChange: (next: FieldConfig) => void;
}) {
  switch (config.type) {
    case "SHORT_TEXT":
      return <ShortTextConfig config={config} onChange={onChange} />;
    case "LONG_TEXT":
      return <LongTextConfig config={config} onChange={onChange} />;
    case "EMAIL":
      return <EmailConfig />;
    case "NUMBER":
      return <NumberConfig config={config} onChange={onChange} />;
    case "SINGLE_SELECT":
      return <SingleSelectConfig config={config} onChange={onChange} />;
    case "MULTI_SELECT":
      return <MultiSelectConfig config={config} onChange={onChange} />;
    case "RATING":
      return <RatingConfig config={config} onChange={onChange} />;
    case "DATE":
      return <DateConfig config={config} onChange={onChange} />;
    case "YES_NO":
      return <YesNoConfig config={config} onChange={onChange} />;
  }
}

function NumInput({
  label,
  value,
  onChange,
  step,
}: {
  label: string;
  value: number | undefined;
  onChange: (next: number | undefined) => void;
  step?: number | "any";
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      <Input
        type="number"
        step={step}
        value={value ?? ""}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === "") return onChange(undefined);
          const n = Number(raw);
          if (Number.isFinite(n)) onChange(n);
        }}
      />
    </div>
  );
}

function TextInputRow({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string | undefined;
  onChange: (next: string | undefined) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      <Input
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value || undefined)}
      />
    </div>
  );
}

// Generates the next unique option value for a SELECT field.
function nextOptionValue(options: FieldOption[]): string {
  const taken = new Set(options.map((o) => o.value));
  let i = options.length + 1;
  while (taken.has(`option-${i}`)) i++;
  return `option-${i}`;
}

function ShortTextConfig({
  config,
  onChange,
}: {
  config: Extract<FieldConfig, { type: "SHORT_TEXT" }>;
  onChange: (c: FieldConfig) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <NumInput
        label="Min length"
        value={config.minLength}
        onChange={(v) => onChange({ ...config, minLength: v })}
        step={1}
      />
      <NumInput
        label="Max length"
        value={config.maxLength}
        onChange={(v) => onChange({ ...config, maxLength: v })}
        step={1}
      />
      <TextInputRow
        label="Regex pattern"
        value={config.regex}
        onChange={(v) => onChange({ ...config, regex: v })}
        placeholder="^[A-Z]+$"
      />
      <TextInputRow
        label="Regex error message"
        value={config.regexMessage}
        onChange={(v) => onChange({ ...config, regexMessage: v })}
        placeholder="Must be uppercase letters"
      />
    </div>
  );
}

function LongTextConfig({
  config,
  onChange,
}: {
  config: Extract<FieldConfig, { type: "LONG_TEXT" }>;
  onChange: (c: FieldConfig) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <NumInput
        label="Min length"
        value={config.minLength}
        onChange={(v) => onChange({ ...config, minLength: v })}
        step={1}
      />
      <NumInput
        label="Max length"
        value={config.maxLength}
        onChange={(v) => onChange({ ...config, maxLength: v })}
        step={1}
      />
    </div>
  );
}

function EmailConfig() {
  return (
    <p className="text-xs text-muted-foreground">
      Email validation runs automatically on the public form.
    </p>
  );
}

function NumberConfig({
  config,
  onChange,
}: {
  config: Extract<FieldConfig, { type: "NUMBER" }>;
  onChange: (c: FieldConfig) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <NumInput
        label="Min"
        value={config.min}
        onChange={(v) => onChange({ ...config, min: v })}
        step="any"
      />
      <NumInput
        label="Max"
        value={config.max}
        onChange={(v) => onChange({ ...config, max: v })}
        step="any"
      />
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium">Integers only</Label>
        <Switch
          checked={!!config.integer}
          onCheckedChange={(checked) => onChange({ ...config, integer: checked })}
        />
      </div>
    </div>
  );
}

function OptionsEditor({
  options,
  onChange,
}: {
  options: FieldOption[];
  onChange: (next: FieldOption[]) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-xs font-medium">Options</Label>
      {options.map((opt, i) => (
        <div key={opt.value} className="flex gap-2">
          <Input
            value={opt.label}
            placeholder={`Option ${i + 1}`}
            onChange={(e) => {
              const label = e.target.value;
              const next = options.slice();
              next[i] = { value: label || opt.value, label };
              onChange(next);
            }}
          />
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={options.length <= 1}
            onClick={() => onChange(options.filter((_, j) => j !== i))}
            className="text-muted-foreground hover:text-destructive shrink-0"
          >
            <Trash2 />
          </Button>
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        className="self-start mt-1"
        onClick={() =>
          onChange([
            ...options,
            { value: nextOptionValue(options), label: `Option ${options.length + 1}` },
          ])
        }
      >
        <Plus />
        Add option
      </Button>
    </div>
  );
}

function SingleSelectConfig({
  config,
  onChange,
}: {
  config: Extract<FieldConfig, { type: "SINGLE_SELECT" }>;
  onChange: (c: FieldConfig) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <OptionsEditor
        options={config.options}
        onChange={(options) => onChange({ ...config, options })}
      />
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs font-medium">Display as</Label>
        <Select
          value={config.display ?? "radio"}
          onValueChange={(v) => onChange({ ...config, display: v as "dropdown" | "radio" })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="radio">Radio</SelectItem>
            <SelectItem value="dropdown">Dropdown</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function MultiSelectConfig({
  config,
  onChange,
}: {
  config: Extract<FieldConfig, { type: "MULTI_SELECT" }>;
  onChange: (c: FieldConfig) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <OptionsEditor
        options={config.options}
        onChange={(options) => onChange({ ...config, options })}
      />
      <NumInput
        label="Min selected"
        value={config.minSelected}
        onChange={(v) => onChange({ ...config, minSelected: v })}
        step={1}
      />
      <NumInput
        label="Max selected"
        value={config.maxSelected}
        onChange={(v) => onChange({ ...config, maxSelected: v })}
        step={1}
      />
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs font-medium">Display as</Label>
        <Select
          value={config.display ?? "checkbox"}
          onValueChange={(v) => onChange({ ...config, display: v as "checkbox" | "tags" })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="checkbox">Checkbox</SelectItem>
            <SelectItem value="tags">Tags</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function RatingConfig({
  config,
  onChange,
}: {
  config: Extract<FieldConfig, { type: "RATING" }>;
  onChange: (c: FieldConfig) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <NumInput
        label="Maximum rating (2-10)"
        value={config.max}
        onChange={(v) => onChange({ ...config, max: v })}
        step={1}
      />
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs font-medium">Icon</Label>
        <Select
          value={config.icon ?? "star"}
          onValueChange={(v) => onChange({ ...config, icon: v as "star" | "heart" | "thumb" })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="star">Star</SelectItem>
            <SelectItem value="heart">Heart</SelectItem>
            <SelectItem value="thumb">Thumb</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function DateConfig({
  config,
  onChange,
}: {
  config: Extract<FieldConfig, { type: "DATE" }>;
  onChange: (c: FieldConfig) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs font-medium">Earliest date</Label>
        <Input
          type="date"
          value={config.minDate ?? ""}
          onChange={(e) => onChange({ ...config, minDate: e.target.value || undefined })}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs font-medium">Latest date</Label>
        <Input
          type="date"
          value={config.maxDate ?? ""}
          onChange={(e) => onChange({ ...config, maxDate: e.target.value || undefined })}
        />
      </div>
    </div>
  );
}

function YesNoConfig({
  config,
  onChange,
}: {
  config: Extract<FieldConfig, { type: "YES_NO" }>;
  onChange: (c: FieldConfig) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <TextInputRow
        label="Yes label"
        value={config.yesLabel}
        onChange={(v) => onChange({ ...config, yesLabel: v })}
        placeholder="Yes"
      />
      <TextInputRow
        label="No label"
        value={config.noLabel}
        onChange={(v) => onChange({ ...config, noLabel: v })}
        placeholder="No"
      />
    </div>
  );
}

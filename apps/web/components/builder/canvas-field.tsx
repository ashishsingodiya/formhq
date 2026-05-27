"use client";

import React, { forwardRef, useEffect, useRef } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { type FieldConfig } from "~/lib/field-config";

type FieldOption = { value: string; label: string };

export type CanvasFieldData = {
  id: string;
  title: string;
  description: string | null;
  placeholder: string | null;
  type: string;
  isRequired: boolean;
  config: FieldConfig;
};

function nextOptionValue(options: FieldOption[]): string {
  const taken = new Set(options.map((o) => o.value));
  let i = options.length + 1;
  while (taken.has(`option-${i}`)) i++;
  return `option-${i}`;
}

export function CanvasField({
  field,
  onTitleChange,
  onDescriptionChange,
  onConfigChange,
  theme,
}: {
  field: CanvasFieldData;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onConfigChange: (config: FieldConfig) => void;
  theme: {
    fg: string;
    primary: string;
    border: string;
    radius: string;
    fontFamily: string;
    headingWeight: string;
  };
}) {
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const [localTitle, setLocalTitle] = React.useState(field.title);
  const [localDesc, setLocalDesc] = React.useState(field.description ?? "");

  const fieldIdRef = useRef(field.id);
  useEffect(() => {
    if (field.id !== fieldIdRef.current) {
      setLocalTitle(field.title);
      setLocalDesc(field.description ?? "");
      fieldIdRef.current = field.id;
    }
  }, [field.id, field.title, field.description]);

  return (
    <div
      className="w-full max-w-xl mx-auto flex flex-col gap-4"
      style={{ fontFamily: theme.fontFamily }}
    >
      <div className="flex flex-col gap-1">
        <AutoResizeTextarea
          ref={titleRef}
          value={localTitle}
          onChange={(v) => {
            setLocalTitle(v);
            onTitleChange(v);
          }}
          placeholder="Question title"
          className="text-2xl font-semibold bg-transparent border-0 outline-none resize-none w-full leading-tight"
          style={{ color: theme.fg, fontWeight: theme.headingWeight }}
        />
        <AutoResizeTextarea
          value={localDesc}
          onChange={(v) => {
            setLocalDesc(v);
            onDescriptionChange(v);
          }}
          placeholder="Description (optional)"
          className="text-sm bg-transparent border-0 outline-none resize-none w-full opacity-60"
          style={{ color: theme.fg }}
        />
      </div>

      <FieldWidget
        field={{ ...field, title: localTitle, description: localDesc }}
        theme={theme}
        onConfigChange={onConfigChange}
      />
    </div>
  );
}

export function CanvasWelcome({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  theme,
}: {
  title: string;
  description: string | null;
  onTitleChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  theme: {
    fg: string;
    primary: string;
    border: string;
    radius: string;
    fontFamily: string;
    headingWeight: string;
  };
}) {
  const [localTitle, setLocalTitle] = React.useState(title);
  const [localDesc, setLocalDesc] = React.useState(description ?? "");

  const hydratedRef = useRef(false);
  useEffect(() => {
    if (!hydratedRef.current && title) {
      setLocalTitle(title);
      setLocalDesc(description ?? "");
      hydratedRef.current = true;
    }
  }, [title, description]);

  return (
    <div
      className="w-full max-w-xl mx-auto flex flex-col gap-3"
      style={{ fontFamily: theme.fontFamily }}
    >
      <AutoResizeTextarea
        value={localTitle}
        onChange={(v) => {
          setLocalTitle(v);
          onTitleChange(v);
        }}
        placeholder="Form title"
        className="text-3xl font-bold bg-transparent border-0 outline-none resize-none w-full leading-tight"
        style={{ color: theme.fg, fontWeight: theme.headingWeight }}
      />
      <AutoResizeTextarea
        value={localDesc}
        onChange={(v) => {
          setLocalDesc(v);
          onDescriptionChange(v);
        }}
        placeholder="Add a description (optional)"
        className="text-base bg-transparent border-0 outline-none resize-none w-full opacity-70"
        style={{ color: theme.fg }}
      />
      <div className="mt-4">
        <div
          className="inline-flex items-center px-6 py-2.5 text-sm font-medium"
          style={{
            background: theme.primary,
            color: "#fff",
            borderRadius: theme.radius,
          }}
        >
          Start →
        </div>
      </div>
    </div>
  );
}

export function CanvasEndings({
  theme,
}: {
  theme: {
    fg: string;
    primary: string;
    border: string;
    radius: string;
    fontFamily: string;
    headingWeight: string;
  };
}) {
  return (
    <div
      className="w-full max-w-xl mx-auto flex flex-col gap-3 opacity-60"
      style={{ fontFamily: theme.fontFamily }}
    >
      <p
        className="text-3xl font-bold"
        style={{ color: theme.fg, fontWeight: theme.headingWeight }}
      >
        Thanks for completing!
      </p>
      <p className="text-base" style={{ color: theme.fg }}>
        Your response has been recorded.
      </p>
    </div>
  );
}

function FieldWidget({
  field,
  theme,
  onConfigChange,
}: {
  field: CanvasFieldData;
  theme: {
    fg: string;
    primary: string;
    border: string;
    radius: string;
    fontFamily: string;
    headingWeight: string;
  };
  onConfigChange: (config: FieldConfig) => void;
}) {
  const inputStyle: React.CSSProperties = {
    color: theme.fg,
    borderColor: theme.border,
    borderRadius: theme.radius,
    background: "transparent",
  };

  switch (field.type) {
    case "SHORT_TEXT":
    case "EMAIL":
    case "NUMBER":
    case "DATE":
      return (
        <div className="w-full px-3 py-2.5 border text-sm opacity-60" style={inputStyle}>
          {field.placeholder ??
            (field.type === "EMAIL"
              ? "email@example.com"
              : field.type === "NUMBER"
                ? "0"
                : field.type === "DATE"
                  ? "yyyy-mm-dd"
                  : "Your answer")}
        </div>
      );

    case "LONG_TEXT":
      return (
        <div
          className="w-full px-3 py-2.5 border text-sm opacity-60 min-h-[80px]"
          style={inputStyle}
        >
          {field.placeholder ?? "Your answer"}
        </div>
      );

    case "YES_NO": {
      const cfg = field.config as { yesLabel?: string; noLabel?: string };
      return (
        <div className="flex gap-3">
          {[cfg.yesLabel ?? "Yes", cfg.noLabel ?? "No"].map((label) => (
            <div key={label} className="px-6 py-2.5 border text-sm font-medium" style={inputStyle}>
              {label}
            </div>
          ))}
        </div>
      );
    }

    case "RATING": {
      const cfg = field.config as { max?: number; icon?: string };
      const max = cfg.max ?? 5;
      const icon = cfg.icon ?? "star";
      return (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            {Array.from({ length: max }).map((_, i) => (
              <RatingIcon key={i} icon={icon} color={theme.primary} filled={false} />
            ))}
          </div>
          <div className="flex gap-2">
            {Array.from({ length: max }).map((_, i) => (
              <span
                key={i}
                className="text-xs opacity-50"
                style={{ color: theme.fg, width: 28, textAlign: "center" }}
              >
                {i + 1}
              </span>
            ))}
          </div>
        </div>
      );
    }

    case "SINGLE_SELECT":
    case "MULTI_SELECT": {
      const cfg = field.config as { options?: FieldOption[]; display?: string };
      const options = cfg.options ?? [];
      const isMulti = field.type === "MULTI_SELECT";

      const updateOptions = (next: FieldOption[]) =>
        onConfigChange({ ...field.config, options: next });

      return (
        <div className="flex flex-col gap-2">
          {options.map((opt, i) => (
            <div key={opt.value} className="flex items-center gap-2 group">
              <div
                className="size-4 shrink-0 border"
                style={{
                  borderColor: theme.border,
                  borderRadius: isMulti ? "3px" : "50%",
                }}
              />
              <input
                value={opt.label}
                onChange={(e) => {
                  const label = e.target.value;
                  const next = options.slice();
                  next[i] = { value: opt.value, label };
                  updateOptions(next);
                }}
                placeholder={`Option ${i + 1}`}
                className="flex-1 bg-transparent border-0 outline-none text-sm py-1.5 border-b border-transparent focus:border-b"
                style={{ color: theme.fg, borderBottomColor: theme.border }}
              />
              <Button
                variant="ghost"
                size="icon-sm"
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                disabled={options.length <= 1}
                onClick={() => updateOptions(options.filter((_, j) => j !== i))}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          ))}
          <button
            onClick={() =>
              updateOptions([...options, { value: nextOptionValue(options), label: "" }])
            }
            className="flex items-center gap-2 text-sm opacity-60 hover:opacity-100 transition-opacity mt-1 w-fit"
            style={{ color: theme.fg }}
          >
            <Plus className="size-4" />
            Add choice
          </button>
        </div>
      );
    }

    default:
      return null;
  }
}

function RatingIcon({ icon, color, filled }: { icon: string; color: string; filled: boolean }) {
  const style: React.CSSProperties = {
    width: 28,
    height: 28,
    color: filled ? color : "transparent",
    stroke: color,
    strokeWidth: 1.5,
  };

  if (icon === "heart") {
    return (
      <svg viewBox="0 0 24 24" style={style} fill={filled ? color : "none"}>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    );
  }
  if (icon === "thumb") {
    return (
      <svg viewBox="0 0 24 24" style={style} fill={filled ? color : "none"}>
        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
        <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
      </svg>
    );
  }
  // Default: star
  return (
    <svg viewBox="0 0 24 24" style={style} fill={filled ? color : "none"}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

const AutoResizeTextarea = forwardRef<
  HTMLTextAreaElement,
  {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    className?: string;
    style?: React.CSSProperties;
  }
>(function AutoResizeTextarea({ value, onChange, placeholder, className, style }, ref) {
  const innerRef = useRef<HTMLTextAreaElement>(null);
  const resolvedRef = (ref as React.RefObject<HTMLTextAreaElement>) ?? innerRef;

  useEffect(() => {
    const el = resolvedRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value, resolvedRef]);

  return (
    <textarea
      ref={resolvedRef}
      rows={1}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn("overflow-hidden", className)}
      style={style}
    />
  );
});

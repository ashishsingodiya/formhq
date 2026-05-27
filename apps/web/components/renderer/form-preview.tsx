"use client";

import { resolveTheme, type ThemeConfig } from "@repo/themes";
import React, { useCallback, useEffect, useState } from "react";
import { ThemedFormShell } from "~/components/renderer/themed-form-shell";
import {
  ThemedButton,
  ThemedInput,
  ThemedLabel,
  ThemedTextarea,
} from "~/components/renderer/themed-primitives";
import { useSubmitForm } from "~/hooks/api/form";

type PreviewField = {
  id: string;
  title: string;
  type: string;
  description: string | null;
  placeholder: string | null;
  isRequired: boolean;
  order: string;
  config: { type: string } & Record<string, unknown>;
};

export type PreviewForm = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  themeConfig: unknown;
  fields: PreviewField[];
};

type Step = "welcome" | number | "endings";

export function FormPreview({
  form,
  mode,
  className,
}: {
  form: PreviewForm;
  mode: "live" | "preview";
  className?: string;
}) {
  const { submitFormAsync, isPending } = useSubmitForm();

  const [step, setStep] = useState<Step>("welcome");
  const [textValues, setTextValues] = useState<Record<string, string>>({});
  const [multiValues, setMultiValues] = useState<Record<string, Set<string>>>({});
  const [error, setError] = useState<string | null>(null);

  const theme = resolveTheme(form.themeConfig as ThemeConfig);
  const align = theme.layout.alignment;
  const fields = form.fields;

  const validateStep = (fieldIndex: number): string | null => {
    const field = fields[fieldIndex];
    if (!field) return null;
    if (field.type === "MULTI_SELECT") {
      const cfg = field.config as { minSelected?: number; maxSelected?: number };
      const selected = multiValues[field.id] ?? new Set();
      if (field.isRequired && selected.size === 0) return "This field is required.";
      if (cfg.minSelected && selected.size < cfg.minSelected)
        return `Select at least ${cfg.minSelected} option(s).`;
      if (cfg.maxSelected && selected.size > cfg.maxSelected)
        return `Select at most ${cfg.maxSelected} option(s).`;
    } else {
      const val = textValues[field.id] ?? "";
      if (field.isRequired && !val) return "This field is required.";
    }
    return null;
  };

  const goNext = useCallback(async () => {
    setError(null);

    if (step === "welcome") {
      setStep(fields.length > 0 ? 0 : "endings");
      return;
    }

    if (typeof step === "number") {
      const err = validateStep(step);
      if (err) {
        setError(err);
        return;
      }

      if (step < fields.length - 1) {
        setStep(step + 1);
        return;
      }

      // Last field — submit or advance to endings
      if (mode === "preview") {
        setStep("endings");
        return;
      }

      const submissionValues = fields.map((field) => {
        if (field.type === "MULTI_SELECT") {
          const set = multiValues[field.id] ?? new Set<string>();
          return { formFieldId: field.id, value: Array.from(set) };
        }
        return { formFieldId: field.id, value: textValues[field.id] ?? "" };
      });

      try {
        await submitFormAsync({ formId: form.id, values: submissionValues });
        setStep("endings");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Something went wrong. Please try again.";
        setError(message);
      }
    }
  }, [step, fields, textValues, multiValues, mode, submitFormAsync, form.id]);

  const goBack = () => {
    setError(null);
    if (typeof step === "number") {
      setStep(step === 0 ? "welcome" : step - 1);
    }
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || e.shiftKey) return;
      if (e.target instanceof HTMLTextAreaElement) return;
      if (step === "endings") return;
      e.preventDefault();
      void goNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [step, goNext]);

  const textAlign = align === "center" ? "center" : "left";

  return (
    <ThemedFormShell theme={theme}>
      <div
        className={`flex-1 flex flex-col items-center justify-center px-4 py-12 ${className ?? ""}`}
      >
        {step === "welcome" && (
          <div className="w-full max-w-xl flex flex-col gap-4" style={{ textAlign }}>
            <h1
              className="text-4xl font-bold leading-tight"
              style={{ fontWeight: "var(--theme-heading-weight)" }}
            >
              {form.title}
            </h1>
            {form.description && <p className="text-base opacity-70">{form.description}</p>}
            <div className="mt-4">
              <ThemedButton type="button" onClick={() => void goNext()} className="px-8">
                Start →
              </ThemedButton>
            </div>
          </div>
        )}

        {typeof step === "number" &&
          fields[step] &&
          (() => {
            const field = fields[step]!;
            const isLast = step === fields.length - 1;
            return (
              <div className="w-full max-w-xl flex flex-col gap-6" style={{ textAlign }}>
                <p className="text-xs opacity-50 uppercase tracking-widest">
                  {step + 1} / {fields.length}
                </p>

                <div className="flex flex-col gap-1">
                  <ThemedLabel htmlFor={field.id} className="text-2xl font-semibold">
                    {field.title}
                    {field.isRequired && (
                      <span style={{ color: "var(--theme-destructive)", marginLeft: 4 }}>*</span>
                    )}
                  </ThemedLabel>
                  {field.description && <p className="text-sm opacity-60">{field.description}</p>}
                </div>

                <FieldInput
                  field={field}
                  textValue={textValues[field.id] ?? ""}
                  multiValue={multiValues[field.id] ?? new Set()}
                  onTextChange={(v) => setTextValues((p) => ({ ...p, [field.id]: v }))}
                  onMultiChange={(set) => setMultiValues((p) => ({ ...p, [field.id]: set }))}
                  onAutoAdvance={() => void goNext()}
                />

                {error && (
                  <p className="text-sm" style={{ color: "var(--theme-destructive)" }}>
                    {error}
                  </p>
                )}

                <div className="flex items-center gap-3">
                  <ThemedButton type="button" onClick={() => void goNext()} disabled={isPending}>
                    {isLast ? (mode === "live" && isPending ? "Submitting..." : "Submit") : "OK →"}
                  </ThemedButton>
                  <button
                    type="button"
                    onClick={goBack}
                    className="text-sm opacity-50 hover:opacity-80 transition-opacity"
                    style={{ color: "var(--theme-fg)" }}
                  >
                    ← Back
                  </button>
                </div>

                <p className="text-xs opacity-40">
                  Press <kbd className="font-mono">Enter ↵</kbd> to continue
                </p>
              </div>
            );
          })()}

        {step === "endings" && (
          <div className="w-full max-w-xl flex flex-col gap-3" style={{ textAlign }}>
            <h1
              className="text-3xl font-semibold"
              style={{ fontWeight: "var(--theme-heading-weight)" }}
            >
              Thanks for your response!
            </h1>
            <p className="opacity-70 text-sm">Your submission has been recorded.</p>
            {mode === "preview" && (
              <ThemedButton
                type="button"
                variant="outline"
                onClick={() => {
                  setStep("welcome");
                  setTextValues({});
                  setMultiValues({});
                  setError(null);
                }}
                className="mt-4 w-fit"
              >
                Restart preview
              </ThemedButton>
            )}
          </div>
        )}
      </div>
    </ThemedFormShell>
  );
}

function FieldInput({
  field,
  textValue,
  multiValue,
  onTextChange,
  onMultiChange,
  onAutoAdvance,
}: {
  field: PreviewField;
  textValue: string;
  multiValue: Set<string>;
  onTextChange: (v: string) => void;
  onMultiChange: (set: Set<string>) => void;
  onAutoAdvance: () => void;
}) {
  const placeholder = field.placeholder ?? undefined;
  const cfg = field.config as Record<string, unknown>;

  switch (field.type) {
    case "LONG_TEXT":
      return (
        <ThemedTextarea
          id={field.id}
          rows={4}
          required={field.isRequired}
          placeholder={placeholder}
          minLength={cfg.minLength as number | undefined}
          maxLength={cfg.maxLength as number | undefined}
          value={textValue}
          onChange={(e) => onTextChange(e.target.value)}
          autoFocus
        />
      );

    case "SHORT_TEXT":
      return (
        <ThemedInput
          id={field.id}
          required={field.isRequired}
          placeholder={placeholder}
          minLength={cfg.minLength as number | undefined}
          maxLength={cfg.maxLength as number | undefined}
          pattern={cfg.regex as string | undefined}
          title={cfg.regexMessage as string | undefined}
          value={textValue}
          onChange={(e) => onTextChange(e.target.value)}
          autoFocus
        />
      );

    case "EMAIL":
      return (
        <ThemedInput
          id={field.id}
          type="email"
          required={field.isRequired}
          placeholder={placeholder}
          value={textValue}
          onChange={(e) => onTextChange(e.target.value)}
          autoFocus
        />
      );

    case "NUMBER":
      return (
        <ThemedInput
          id={field.id}
          type="number"
          required={field.isRequired}
          placeholder={placeholder}
          step={cfg.integer ? 1 : "any"}
          min={cfg.min as number | undefined}
          max={cfg.max as number | undefined}
          value={textValue}
          onChange={(e) => onTextChange(e.target.value)}
          autoFocus
        />
      );

    case "DATE":
      return (
        <ThemedInput
          id={field.id}
          type="date"
          required={field.isRequired}
          min={cfg.minDate as string | undefined}
          max={cfg.maxDate as string | undefined}
          value={textValue}
          onChange={(e) => onTextChange(e.target.value)}
          autoFocus
        />
      );

    case "YES_NO": {
      const yesLabel = (cfg.yesLabel as string | undefined) ?? "Yes";
      const noLabel = (cfg.noLabel as string | undefined) ?? "No";
      return (
        <div className="flex gap-3">
          <ThemedButton
            type="button"
            variant={textValue === "true" ? "primary" : "outline"}
            onClick={() => {
              onTextChange("true");
              onAutoAdvance();
            }}
          >
            {yesLabel}
          </ThemedButton>
          <ThemedButton
            type="button"
            variant={textValue === "false" ? "primary" : "outline"}
            onClick={() => {
              onTextChange("false");
              onAutoAdvance();
            }}
          >
            {noLabel}
          </ThemedButton>
        </div>
      );
    }

    case "RATING": {
      const max = (cfg.max as number | undefined) ?? 5;
      const current = parseInt(textValue || "0", 10);
      return (
        <div className="flex gap-2 flex-wrap">
          {Array.from({ length: max }).map((_, i) => {
            const n = i + 1;
            const active = current >= n;
            return (
              <ThemedButton
                key={n}
                type="button"
                variant={active ? "primary" : "outline"}
                onClick={() => {
                  onTextChange(String(n));
                }}
                className="size-10! p-0! flex items-center justify-center"
              >
                {n}
              </ThemedButton>
            );
          })}
        </div>
      );
    }

    case "SINGLE_SELECT": {
      const options = (cfg.options as { value: string; label: string }[] | undefined) ?? [];
      const display = (cfg.display as string | undefined) ?? "radio";

      if (display === "dropdown") {
        return (
          <select
            id={field.id}
            required={field.isRequired}
            value={textValue}
            onChange={(e) => onTextChange(e.target.value)}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--theme-primary)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--theme-border)")}
            className="w-full px-3 py-2 outline-none border"
            style={{
              color: "var(--theme-fg)",
              background: "var(--theme-accent)",
              borderColor: "var(--theme-border)",
              borderRadius: "var(--theme-radius)",
            }}
            autoFocus
          >
            <option value="">Select…</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.label}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      }

      return (
        <div className="flex flex-col gap-2">
          {options.map((opt) => (
            <label key={opt.value} className="flex items-center gap-3 text-sm cursor-pointer">
              <input
                type="radio"
                name={field.id}
                value={opt.label}
                required={field.isRequired}
                checked={textValue === opt.label}
                onChange={(e) => {
                  onTextChange(e.target.value);
                  onAutoAdvance();
                }}
              />
              {opt.label}
            </label>
          ))}
        </div>
      );
    }

    case "MULTI_SELECT": {
      const options = (cfg.options as { value: string; label: string }[] | undefined) ?? [];
      return (
        <div className="flex flex-col gap-2">
          {options.map((opt) => {
            const checked = multiValue.has(opt.label);
            return (
              <label key={opt.value} className="flex items-center gap-3 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    const next = new Set(multiValue);
                    if (e.target.checked) next.add(opt.label);
                    else next.delete(opt.label);
                    onMultiChange(next);
                  }}
                />
                {opt.label}
              </label>
            );
          })}
        </div>
      );
    }
  }

  return null;
}

"use client";

import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Skeleton } from "~/components/ui/skeleton";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import { useGetPublicFormBySlug, useSubmitForm } from "~/hooks/api/form";

type FieldType = "TEXT" | "NUMBER" | "EMAIL" | "YES_NO" | "PASSWORD";

export default function PublicFormPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const { form, isLoading } = useGetPublicFormBySlug(slug);
  const { submitFormAsync, isPending } = useSubmitForm();

  const [values, setValues] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const setValue = (fieldId: string, value: string) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    const submissionValues = form.fields.map((field) => ({
      formFieldId: field.id,
      value: values[field.id] ?? "",
    }));

    await submitFormAsync({ formId: form.id, values: submissionValues });
    setSubmitted(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-xl flex flex-col gap-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Form not found</h1>
          <p className="text-muted-foreground text-sm">
            This form &apos; exist or may have been removed.
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <h1 className="text-2xl font-semibold mb-2">Thanks for your response!</h1>
          <p className="text-muted-foreground text-sm">Your submission has been recorded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        {/* Form header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold">{form.title}</h1>
          {form.description && <p className="text-muted-foreground mt-2">{form.description}</p>}
        </div>

        {form.fields.length === 0 ? (
          <p className="text-muted-foreground text-sm">This form has no fields yet.</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {form.fields.map((field) => (
              <div key={field.id} className="flex flex-col gap-1.5">
                <Label htmlFor={field.id}>
                  {field.label}
                  {field.isRequired && <span className="text-destructive ml-1">*</span>}
                </Label>
                {field.description && (
                  <p className="text-xs text-muted-foreground">{field.description}</p>
                )}
                <FieldInput
                  field={field}
                  value={values[field.id] ?? ""}
                  onChange={(v) => setValue(field.id, v)}
                />
              </div>
            ))}

            <Button type="submit" className="w-full mt-2" disabled={isPending}>
              {isPending ? "Submitting..." : "Submit"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: { id: string; type: string; placeholder: string | null; isRequired: boolean };
  value: string;
  onChange: (v: string) => void;
}) {
  const type = field.type as FieldType;
  const placeholder = field.placeholder ?? undefined;

  if (type === "YES_NO") {
    return (
      <div className="flex items-center gap-3">
        <Switch
          id={field.id}
          checked={value === "true"}
          onCheckedChange={(checked) => onChange(checked ? "true" : "false")}
        />
        <span className="text-sm text-muted-foreground">{value === "true" ? "Yes" : "No"}</span>
      </div>
    );
  }

  if (type === "TEXT") {
    return (
      <Textarea
        id={field.id}
        placeholder={placeholder}
        required={field.isRequired}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
      />
    );
  }

  const inputType =
    type === "EMAIL"
      ? "email"
      : type === "NUMBER"
        ? "number"
        : type === "PASSWORD"
          ? "password"
          : "text";

  return (
    <Input
      id={field.id}
      type={inputType}
      placeholder={placeholder}
      required={field.isRequired}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

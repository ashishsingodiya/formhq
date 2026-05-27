"use client";

import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Skeleton } from "~/components/ui/skeleton";
import { Switch } from "~/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Textarea } from "~/components/ui/textarea";
import {
  useCreateField,
  useDeleteField,
  useGetFields,
  useGetFormBySlug,
  useListSubmissions,
  useUpdateField,
} from "~/hooks/api/form";

const FIELD_TYPES = ["TEXT", "NUMBER", "EMAIL", "YES_NO", "PASSWORD"] as const;
type FieldType = (typeof FIELD_TYPES)[number];

const TYPE_LABELS: Record<FieldType, string> = {
  TEXT: "Text",
  NUMBER: "Number",
  EMAIL: "Email",
  YES_NO: "Yes / No",
  PASSWORD: "Password",
};

type FieldForm = {
  label: string;
  type: FieldType;
  description: string;
  placeholder: string;
  isRequired: boolean;
};

const defaultFieldForm: FieldForm = {
  label: "",
  type: "TEXT",
  description: "",
  placeholder: "",
  isRequired: false,
};

type EditingField = { id: string } & FieldForm;

export default function FormBuilderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);

  const { form, isLoading: formLoading } = useGetFormBySlug(slug);
  const formId = form?.id ?? "";

  const { fields, isLoading: fieldsLoading } = useGetFields(formId);
  const { submissions, isLoading: submissionsLoading } = useListSubmissions(formId);
  const { createFieldAsync, isPending: creating } = useCreateField();
  const { updateFieldAsync, isPending: updating } = useUpdateField(formId);
  const { deleteFieldAsync } = useDeleteField(formId);

  const [addOpen, setAddOpen] = useState(false);
  const [fieldForm, setFieldForm] = useState<FieldForm>(defaultFieldForm);
  const [editingField, setEditingField] = useState<EditingField | null>(null);

  const handleAdd = async () => {
    if (!fieldForm.label.trim() || !formId) return;
    await createFieldAsync({
      formId,
      label: fieldForm.label.trim(),
      type: fieldForm.type,
      description: fieldForm.description.trim() || undefined,
      placeholder: fieldForm.placeholder.trim() || undefined,
      isRequired: fieldForm.isRequired,
    });
    setFieldForm(defaultFieldForm);
    setAddOpen(false);
  };

  const handleUpdate = async () => {
    if (!editingField || !editingField.label.trim()) return;
    await updateFieldAsync({
      fieldId: editingField.id,
      label: editingField.label.trim(),
      type: editingField.type,
      description: editingField.description.trim() || null,
      placeholder: editingField.placeholder.trim() || null,
      isRequired: editingField.isRequired,
    });
    setEditingField(null);
  };

  const handleDelete = async (fieldId: string) => {
    await deleteFieldAsync({ fieldId });
  };

  const isLoading = formLoading || (!!formId && fieldsLoading);

  // Build a fieldId → label map for the response table
  const fieldLabelMap = Object.fromEntries((fields ?? []).map((f) => [f.id, f.label]));

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="border-b px-6 py-4 flex items-center gap-4 shrink-0">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href="/dashboard/forms">
            <ArrowLeft />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          {formLoading ? (
            <Skeleton className="h-5 w-48" />
          ) : (
            <>
              <h1 className="text-lg font-semibold truncate">{form?.title}</h1>
              <p className="text-xs text-muted-foreground font-mono">{slug}</p>
            </>
          )}
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)} disabled={!formId}>
          <Plus />
          Add Field
        </Button>
      </header>

      {/* Tabs */}
      <Tabs defaultValue="fields" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="mx-6 mt-4 w-fit shrink-0">
          <TabsTrigger value="fields">Fields</TabsTrigger>
          <TabsTrigger value="responses">
            Responses
            {submissions && submissions.length > 0 && (
              <Badge variant="secondary" className="ml-1.5">
                {submissions.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Fields tab */}
        <TabsContent value="fields" className="flex-1 overflow-auto px-6 py-4">
          {isLoading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          ) : !fields || fields.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
              <p className="text-muted-foreground text-sm">No fields yet.</p>
              <Button variant="outline" size="sm" onClick={() => setAddOpen(true)}>
                <Plus />
                Add your first field
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-w-2xl">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex items-center gap-3 border rounded-lg px-4 py-3 bg-card"
                >
                  <span className="text-xs text-muted-foreground w-5 shrink-0">{index + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {field.label}
                      {field.isRequired && <span className="text-destructive ml-1">*</span>}
                    </p>
                    {field.description && (
                      <p className="text-xs text-muted-foreground truncate">{field.description}</p>
                    )}
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {TYPE_LABELS[field.type as FieldType]}
                  </Badge>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() =>
                        setEditingField({
                          id: field.id,
                          label: field.label,
                          type: field.type as FieldType,
                          description: field.description ?? "",
                          placeholder: field.placeholder ?? "",
                          isRequired: field.isRequired,
                        })
                      }
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(field.id)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Responses tab */}
        <TabsContent value="responses" className="flex-1 overflow-auto px-6 py-4">
          {submissionsLoading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-lg" />
              ))}
            </div>
          ) : !submissions || submissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
              <p className="text-muted-foreground text-sm">No responses yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4 text-muted-foreground font-medium whitespace-nowrap">
                      #
                    </th>
                    {(fields ?? []).map((f) => (
                      <th
                        key={f.id}
                        className="text-left py-2 pr-4 text-muted-foreground font-medium whitespace-nowrap"
                      >
                        {f.label}
                      </th>
                    ))}
                    <th className="text-left py-2 pr-4 text-muted-foreground font-medium whitespace-nowrap">
                      Submitted
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission, index) => {
                    const valueMap = Object.fromEntries(
                      (submission.values ?? []).map((v) => [v.formFieldId, v.value]),
                    );
                    return (
                      <tr key={submission.id} className="border-b last:border-0">
                        <td className="py-2 pr-4 text-muted-foreground">{index + 1}</td>
                        {(fields ?? []).map((f) => (
                          <td key={f.id} className="py-2 pr-4 max-w-48 truncate">
                            {valueMap[f.id] ?? <span className="text-muted-foreground">—</span>}
                          </td>
                        ))}
                        <td className="py-2 pr-4 text-muted-foreground whitespace-nowrap">
                          {submission.createdAt
                            ? new Date(submission.createdAt).toLocaleString()
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Field Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Field</DialogTitle>
          </DialogHeader>
          <FieldFormBody value={fieldForm} onChange={setFieldForm} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={!fieldForm.label.trim() || creating}>
              Add Field
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Field Dialog */}
      <Dialog open={!!editingField} onOpenChange={(o) => !o && setEditingField(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Field</DialogTitle>
          </DialogHeader>
          {editingField && (
            <FieldFormBody
              value={editingField}
              onChange={(v) => setEditingField({ ...editingField, ...v })}
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingField(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={!editingField?.label.trim() || updating}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FieldFormBody({
  value,
  onChange,
}: {
  value: FieldForm;
  onChange: (v: FieldForm) => void;
}) {
  return (
    <div className="flex flex-col gap-4 py-2">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="field-label">Label</Label>
        <Input
          id="field-label"
          placeholder="e.g. Full Name"
          maxLength={100}
          value={value.label}
          onChange={(e) => onChange({ ...value, label: e.target.value })}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Type</Label>
        <Select
          value={value.type}
          onValueChange={(v) => onChange({ ...value, type: v as FieldType })}
        >
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
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="field-placeholder">
          Placeholder <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="field-placeholder"
          placeholder="e.g. Enter your name"
          value={value.placeholder}
          onChange={(e) => onChange({ ...value, placeholder: e.target.value })}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="field-description">
          Description <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id="field-description"
          placeholder="Helper text shown below the field"
          rows={2}
          value={value.description}
          onChange={(e) => onChange({ ...value, description: e.target.value })}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="field-required">Required</Label>
        <Switch
          id="field-required"
          checked={value.isRequired}
          onCheckedChange={(checked) => onChange({ ...value, isRequired: checked })}
        />
      </div>
    </div>
  );
}

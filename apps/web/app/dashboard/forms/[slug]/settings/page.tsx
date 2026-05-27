"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
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
import { Textarea } from "~/components/ui/textarea";
import { useDeleteForm, useGetFormBySlug, useUpdateForm } from "~/hooks/api/form";
import { useDebouncedCallback } from "~/lib/use-debounced-callback";

export default function SettingsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const router = useRouter();
  const { form, isLoading } = useGetFormBySlug(slug);
  const { updateFormAsync } = useUpdateForm(slug);
  const { deleteFormAsync, isPending: isDeleting } = useDeleteForm();

  // Title & description
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Response limit
  const [limitEnabled, setLimitEnabled] = useState(false);
  const [responseLimit, setResponseLimit] = useState("");

  // Expiry date
  const [expiryEnabled, setExpiryEnabled] = useState(false);
  const [expiresAt, setExpiresAt] = useState("");

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false);

  const hydratedRef = useRef(false);
  useEffect(() => {
    if (!form || hydratedRef.current) return;
    setTitle(form.title);
    setDescription(form.description ?? "");
    if (form.responseLimit) {
      setLimitEnabled(true);
      setResponseLimit(form.responseLimit.toString());
    }
    if (form.expiresAt) {
      setExpiryEnabled(true);
      setExpiresAt(new Date(form.expiresAt).toISOString().slice(0, 10));
    }
    hydratedRef.current = true;
  }, [form]);

  const debouncedTitle = useDebouncedCallback((v: string) => {
    if (!form) return;
    void updateFormAsync({ formId: form.id, title: v || "Untitled form" });
  });

  const debouncedDescription = useDebouncedCallback((v: string) => {
    if (!form) return;
    void updateFormAsync({ formId: form.id, description: v || null });
  });

  const debouncedLimit = useDebouncedCallback((value: string) => {
    if (!form) return;
    const n = parseInt(value, 10);
    if (Number.isFinite(n) && n >= 1) {
      void updateFormAsync({ formId: form.id, responseLimit: n });
    }
  });

  const debouncedExpiry = useDebouncedCallback((value: string) => {
    if (!form) return;
    const date = new Date(`${value}T23:59:59`);
    if (!isNaN(date.getTime())) {
      void updateFormAsync({ formId: form.id, expiresAt: date });
    }
  });

  const handleDelete = async () => {
    if (!form) return;
    await deleteFormAsync({ formId: form.id });
    router.push("/dashboard/forms");
  };

  if (isLoading || !form) {
    return (
      <div className="px-6 py-6 max-w-xl flex flex-col gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="px-6 py-6 max-w-xl flex flex-col gap-6">
      {/* ── Form identity ── */}
      <div className="border rounded-lg p-4 flex flex-col gap-4">
        <p className="text-sm font-medium">Form details</p>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="form-title" className="text-xs text-muted-foreground">
            Title
          </Label>
          <Input
            id="form-title"
            maxLength={55}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              debouncedTitle(e.target.value);
            }}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="form-desc" className="text-xs text-muted-foreground">
            Description <span className="text-muted-foreground/60">(optional)</span>
          </Label>
          <Textarea
            id="form-desc"
            maxLength={300}
            rows={3}
            placeholder="What is this form for?"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              debouncedDescription(e.target.value);
            }}
          />
        </div>
      </div>

      {/* ── Published ── */}
      <Section title="Published" description="When off, the public form rejects all submissions.">
        <Switch
          checked={form.isPublished}
          onCheckedChange={(checked) =>
            void updateFormAsync({ formId: form.id, isPublished: checked })
          }
        />
      </Section>

      {/* ── Visibility ── */}
      <Section
        title="Visibility"
        description="Unlisted forms are reachable only via the share link."
      >
        <Select
          value={form.visibility}
          onValueChange={(value) =>
            void updateFormAsync({ formId: form.id, visibility: value as "PUBLIC" | "UNLISTED" })
          }
        >
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="UNLISTED">Unlisted</SelectItem>
            <SelectItem value="PUBLIC">Public</SelectItem>
          </SelectContent>
        </Select>
      </Section>

      {/* ── Response limit ── */}
      <div className="border rounded-lg p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            <Label className="text-sm font-medium">Response limit</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Stop accepting submissions after a set number of responses.
            </p>
          </div>
          <Switch
            checked={limitEnabled}
            onCheckedChange={(checked) => {
              setLimitEnabled(checked);
              if (!checked) {
                setResponseLimit("");
                void updateFormAsync({ formId: form.id, responseLimit: null });
              }
            }}
          />
        </div>
        {limitEnabled && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="response-limit" className="text-xs text-muted-foreground">
              Max responses
            </Label>
            <Input
              id="response-limit"
              type="number"
              min={1}
              step={1}
              className="w-40"
              placeholder="e.g. 100"
              value={responseLimit}
              onChange={(e) => {
                setResponseLimit(e.target.value);
                debouncedLimit(e.target.value);
              }}
            />
          </div>
        )}
      </div>

      {/* ── Expiry date ── */}
      <div className="border rounded-lg p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            <Label className="text-sm font-medium">Expiry date</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Automatically stop accepting submissions after a specific date.
            </p>
          </div>
          <Switch
            checked={expiryEnabled}
            onCheckedChange={(checked) => {
              setExpiryEnabled(checked);
              if (!checked) {
                setExpiresAt("");
                void updateFormAsync({ formId: form.id, expiresAt: null });
              }
            }}
          />
        </div>
        {expiryEnabled && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="expires-at" className="text-xs text-muted-foreground">
              Closes on
            </Label>
            <Input
              id="expires-at"
              type="date"
              className="w-44"
              value={expiresAt}
              onChange={(e) => {
                setExpiresAt(e.target.value);
                debouncedExpiry(e.target.value);
              }}
            />
          </div>
        )}
      </div>

      {/* ── Danger zone ── */}
      <div className="border border-destructive/40 rounded-lg p-4 flex items-start justify-between gap-6">
        <div className="flex-1 min-w-0">
          <Label className="text-sm font-medium text-destructive">Delete form</Label>
          <p className="text-xs text-muted-foreground mt-1">
            Permanently delete this form and all its submissions. This cannot be undone.
          </p>
        </div>
        <Button
          variant="destructive"
          size="sm"
          className="shrink-0"
          onClick={() => setDeleteOpen(true)}
        >
          Delete
        </Button>
      </div>

      {/* ── Delete confirmation dialog ── */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete form</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">{form.title}</span>? This will permanently
            remove the form and all its submissions.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete form"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border rounded-lg p-4 flex items-start justify-between gap-6">
      <div className="flex-1 min-w-0">
        <Label className="text-sm font-medium">{title}</Label>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

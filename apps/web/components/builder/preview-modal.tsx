"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { DeviceToggle, type DeviceMode } from "~/components/builder/device-toggle";
import { FormPreview, type PreviewForm } from "~/components/renderer/form-preview";
import { Dialog, DialogContent, DialogTitle } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

export function PreviewModal({
  open,
  onOpenChange,
  form,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: PreviewForm | null;
}) {
  const [device, setDevice] = useState<DeviceMode>("desktop");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "p-0 gap-0 overflow-hidden transition-all",
          device === "desktop" ? "max-w-5xl!" : "max-w-sm!",
        )}
      >
        <div className="px-4 py-3 border-b flex items-center justify-between shrink-0">
          <DialogTitle className="text-sm font-semibold">Preview</DialogTitle>
          <div className="flex items-center gap-3">
            <DeviceToggle value={device} onChange={setDevice} />
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onOpenChange(false)}
              aria-label="Close"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        <div className="overflow-auto" style={{ height: "80vh" }}>
          {form ? (
            <FormPreview form={form} mode="preview" />
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              Loading…
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

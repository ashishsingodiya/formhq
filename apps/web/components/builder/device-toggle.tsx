"use client";

import { Monitor, Smartphone } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

export type DeviceMode = "desktop" | "mobile";

export function DeviceToggle({
  value,
  onChange,
}: {
  value: DeviceMode;
  onChange: (mode: DeviceMode) => void;
}) {
  return (
    <div className="inline-flex items-center gap-0.5 border rounded-md p-0.5">
      <Button
        variant="ghost"
        size="icon-sm"
        className={cn("size-7", value === "desktop" && "bg-accent text-accent-foreground")}
        onClick={() => onChange("desktop")}
        aria-label="Desktop preview"
      >
        <Monitor />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        className={cn("size-7", value === "mobile" && "bg-accent text-accent-foreground")}
        onClick={() => onChange("mobile")}
        aria-label="Mobile preview"
      >
        <Smartphone />
      </Button>
    </div>
  );
}

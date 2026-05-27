"use client";

import { Check, Loader2 } from "lucide-react";

export function SaveStatus({ isPending }: { isPending: boolean }) {
  if (isPending) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="size-3 animate-spin" />
        Saving…
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <Check className="size-3" />
      Saved
    </span>
  );
}

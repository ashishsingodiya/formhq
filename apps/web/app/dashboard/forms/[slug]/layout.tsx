"use client";

import { useIsMutating } from "@tanstack/react-query";
import { ArrowLeft, Globe, Lock, RefreshCw } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Skeleton } from "~/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { useGetFormBySlug, useUpdateForm } from "~/hooks/api/form";
import { cn } from "~/lib/utils";

const TABS = [
  { label: "Edit", href: "edit" },
  { label: "Share", href: "share" },
  { label: "Submissions", href: "submissions" },
  { label: "Analytics", href: "analytics" },
  { label: "Settings", href: "settings" },
] as const;

export default function FormSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = React.use(params);
  const pathname = usePathname();

  const { form, isLoading } = useGetFormBySlug(slug);
  const { updateFormAsync } = useUpdateForm(slug);

  const isMutating = useIsMutating() > 0;
  const [spinning, setSpinning] = useState(false);
  const spinTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isMutating) {
      if (spinTimerRef.current) clearTimeout(spinTimerRef.current);
      setSpinning(true);
    } else {
      spinTimerRef.current = setTimeout(() => setSpinning(false), 1000);
    }
    return () => {
      if (spinTimerRef.current) clearTimeout(spinTimerRef.current);
    };
  }, [isMutating]);

  const handlePublishToggle = () => {
    if (!form) return;
    void updateFormAsync({ formId: form.id, isPublished: !form.isPublished });
  };

  return (
    <div className="flex flex-col h-full">
      <header className="border-b shrink-0 px-4 py-3 flex items-center">
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <Button variant="ghost" size="icon-sm" asChild className="shrink-0">
            <Link href="/dashboard/forms">
              <ArrowLeft />
            </Link>
          </Button>

          <div className="min-w-0 shrink">
            {isLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              <h1 className="text-sm font-semibold truncate max-w-48">{form?.title}</h1>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Badge
              variant={form?.isPublished ? "default" : "secondary"}
              className={
                form?.isPublished
                  ? "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/20 border-emerald-500/30"
                  : ""
              }
            >
              <span
                className={cn(
                  "size-1.5 rounded-full mr-1",
                  form?.isPublished ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground",
                )}
              />
              {form?.isPublished ? "Live" : "Draft"}
            </Badge>
          </div>
        </div>

        <nav className="shrink-0 flex justify-center">
          <div className="inline-flex items-center gap-0.5 bg-muted rounded-xl px-1 py-1">
            {TABS.map(({ label, href }) => {
              const fullHref = `/dashboard/forms/${slug}/${href}`;
              const active = pathname.startsWith(fullHref);
              return (
                <Link
                  key={href}
                  href={fullHref}
                  className={cn(
                    "px-4 py-1.5 text-sm rounded-lg transition-colors font-medium",
                    active
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="flex-1 flex items-center justify-end gap-2">
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <RefreshCw
                  className={cn(
                    "size-5 mx-4 text-muted-foreground transition-opacity cursor-default",
                    spinning ? "opacity-100 animate-spin" : "opacity-30",
                  )}
                />
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {spinning ? "Saving changes..." : "All changes saved"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Select
            value={form?.visibility ?? "UNLISTED"}
            disabled={!form}
            onValueChange={(v) => {
              if (!form) return;
              void updateFormAsync({ formId: form.id, visibility: v as "PUBLIC" | "UNLISTED" });
            }}
          >
            <SelectTrigger className="h-8 w-32 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="UNLISTED">
                <div className="flex items-center gap-2">
                  <Lock className="size-3.5" />
                  Unlisted
                </div>
              </SelectItem>
              <SelectItem value="PUBLIC">
                <div className="flex items-center gap-2">
                  <Globe className="size-3.5" />
                  Public
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {isLoading ? (
            <Skeleton className="h-8 w-24 rounded-md" />
          ) : (
            <Button
              size="sm"
              variant={form?.isPublished ? "outline" : "default"}
              disabled={!form}
              onClick={handlePublishToggle}
              className="w-24"
            >
              {form?.isPublished ? "Unpublish" : "Publish"}
            </Button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}

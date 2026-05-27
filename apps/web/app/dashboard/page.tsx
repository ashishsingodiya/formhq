"use client";

import { FileText, Globe, Plus, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Skeleton } from "~/components/ui/skeleton";
import { Textarea } from "~/components/ui/textarea";
import { useCreateForm, useDashboardStats, useListForms } from "~/hooks/api/form";
import { cn } from "~/lib/utils";

export default function DashboardPage() {
  const { stats, isLoading: statsLoading } = useDashboardStats();
  const { forms, isLoading: formsLoading } = useListForms();
  const { createFormAsync, isPending, isError } = useCreateForm();

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = async () => {
    if (!title.trim()) return;
    await createFormAsync({ title: title.trim(), description: description.trim() || undefined });
    setTitle("");
    setDescription("");
    setOpen(false);
  };

  const recentForms = (forms ?? []).slice(0, 5);

  return (
    <div className="flex flex-col h-full">
      <header className="border-b px-6 py-4 shrink-0 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus />
              New Form
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a new form</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Customer Feedback"
                  maxLength={55}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="description">
                  Description <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="What is this form for?"
                  maxLength={300}
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              {isError && (
                <p className="text-sm text-destructive">Something went wrong. Please try again.</p>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={!title.trim() || isPending}>
                Create Form
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <div className="flex-1 overflow-auto px-6 py-6 flex flex-col gap-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Total forms"
            value={statsLoading ? null : (stats?.totalForms ?? 0).toLocaleString()}
            icon={FileText}
            color="text-blue-500"
            bg="bg-blue-500/10"
          />
          <StatCard
            label="Published forms"
            value={statsLoading ? null : (stats?.publishedForms ?? 0).toLocaleString()}
            icon={Globe}
            color="text-emerald-500"
            bg="bg-emerald-500/10"
          />
          <StatCard
            label="Total responses"
            value={statsLoading ? null : (stats?.totalResponses ?? 0).toLocaleString()}
            icon={TrendingUp}
            color="text-violet-500"
            bg="bg-violet-500/10"
          />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Recent forms</h2>
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
              <Link href="/dashboard/forms">View all</Link>
            </Button>
          </div>

          {formsLoading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-lg" />
              ))}
            </div>
          ) : recentForms.length === 0 ? (
            <div className="border rounded-xl py-16 flex flex-col items-center gap-3 text-center">
              <FileText className="size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No forms yet.</p>
              <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
                <Plus />
                Create your first form
              </Button>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden divide-y">
              {recentForms.map((form) => (
                <Link
                  key={form.id}
                  href={`/dashboard/forms/${form.slug}`}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="size-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                    <FileText className="size-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{form.title}</p>
                    {form.description && (
                      <p className="text-xs text-muted-foreground truncate">{form.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-medium",
                        form.isPublished
                          ? "bg-emerald-500/10 text-emerald-700"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {form.isPublished ? "Live" : "Draft"}
                    </span>
                    {form.createdAt && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(form.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: string | null;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
}) {
  return (
    <Card>
      <CardContent className="pt-5 flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          {value === null ? (
            <Skeleton className="h-7 w-16 mt-1" />
          ) : (
            <p className="text-2xl font-semibold mt-1">{value}</p>
          )}
        </div>
        <div className={cn("size-9 rounded-md flex items-center justify-center", bg)}>
          <Icon className={cn("size-4", color)} />
        </div>
      </CardContent>
    </Card>
  );
}

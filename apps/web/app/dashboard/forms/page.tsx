"use client";

import { FileText, MoreHorizontal, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Skeleton } from "~/components/ui/skeleton";
import { Textarea } from "~/components/ui/textarea";
import { useCreateForm, useDeleteForm, useListForms } from "~/hooks/api/form";

export default function FormsPage() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deletingFormId, setDeletingFormId] = useState<string | null>(null);

  const { forms, isLoading } = useListForms();
  const { createFormAsync, isPending, isError } = useCreateForm();
  const { deleteFormAsync, isPending: isDeleting } = useDeleteForm();

  const filtered = (forms ?? []).filter((f) =>
    f.title.toLowerCase().includes(search.toLowerCase()),
  );

  const handleCreate = async () => {
    if (!title.trim()) return;
    await createFormAsync({ title: title.trim(), description: description.trim() || undefined });
    setTitle("");
    setDescription("");
    setOpen(false);
  };

  const handleDelete = async () => {
    if (!deletingFormId) return;
    await deleteFormAsync({ formId: deletingFormId });
    setDeletingFormId(null);
  };

  return (
    <div className="flex flex-col h-full">
      <header className="border-b px-6 py-4 flex items-center justify-between shrink-0">
        <h1 className="text-lg font-semibold">Forms</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search forms..."
              className="pl-8 w-56"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
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
                  <p className="text-sm text-destructive">
                    Something went wrong. Please try again.
                  </p>
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
        </div>
      </header>

      <div className="flex-1 overflow-auto px-6 py-6">
        <p className="text-sm text-muted-foreground mb-5">
          {isLoading ? "Loading..." : `${forms?.length ?? 0} forms`}
        </p>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
            <FileText className="size-10 text-muted-foreground" />
            <p className="text-muted-foreground">
              {search ? "No forms match your search." : "No forms yet."}
            </p>
            {!search && (
              <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
                <Plus />
                Create your first form
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((form) => (
              <Link key={form.id} href={`/dashboard/forms/${form.slug}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{form.title}</CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>Copy link</DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={(e) => {
                              e.preventDefault();
                              setDeletingFormId(form.id);
                            }}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {form.description && <CardDescription>{form.description}</CardDescription>}
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground font-mono">{form.slug}</p>
                  </CardContent>
                  <CardFooter className="text-xs text-muted-foreground">
                    {form.createdAt
                      ? `Created ${new Date(form.createdAt).toLocaleDateString()}`
                      : null}
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!deletingFormId} onOpenChange={(o) => !o && setDeletingFormId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete form</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this form? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingFormId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

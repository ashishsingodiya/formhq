"use client";

import React from "react";
import { FormPreview } from "~/components/renderer/form-preview";
import { Skeleton } from "~/components/ui/skeleton";
import { useGetPublicFormBySlug } from "~/hooks/api/form";

export default function PublicFormPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const { form, isLoading } = useGetPublicFormBySlug(slug);

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
            This form doesn&apos;t exist or may have been removed.
          </p>
        </div>
      </div>
    );
  }

  return <FormPreview form={form} mode="live" />;
}

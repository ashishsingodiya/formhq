"use client";

import { Download, Loader2 } from "lucide-react";
import React from "react";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { useGetFields, useGetFormBySlug, useInfiniteListSubmissions } from "~/hooks/api/form";

export default function SubmissionsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const { form } = useGetFormBySlug(slug);
  const { fields } = useGetFields(form?.id ?? "");
  const { submissions, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteListSubmissions(form?.id ?? "");

  return (
    <div className="px-6 py-6">
      <ResponsesTable
        fields={fields ?? []}
        submissions={submissions}
        isLoading={isLoading || !form}
        formTitle={form?.title ?? "responses"}
        hasNextPage={!!hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={() => void fetchNextPage()}
      />
    </div>
  );
}

function ResponsesTable({
  fields,
  submissions,
  isLoading,
  formTitle,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: {
  fields: { id: string; title: string; type: string }[];
  submissions: {
    id: string;
    values: { formFieldId: string; value: string | string[] }[] | null;
    createdAt: Date | string | null;
  }[];
  isLoading: boolean;
  formTitle: string;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
}) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 rounded-lg" />
        ))}
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
        <p className="text-muted-foreground text-sm">No responses yet.</p>
      </div>
    );
  }

  const formatValue = (value: string | string[] | undefined, type: string) => {
    if (value === undefined || value === "" || (Array.isArray(value) && value.length === 0))
      return "—";
    if (Array.isArray(value)) return value.join(", ");
    if (type === "RATING") return `${"★".repeat(Number(value) || 0)} ${value}`;
    if (type === "YES_NO") return value === "true" ? "Yes" : "No";
    return value;
  };

  const handleExportCsv = () => {
    const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;
    const headers = ["#", ...fields.map((f) => f.title), "Submitted at"];
    const rows = submissions.map((s, i) => {
      const valueMap = Object.fromEntries((s.values ?? []).map((v) => [v.formFieldId, v.value]));
      const fieldCells = fields.map((f) => {
        const raw = valueMap[f.id];
        if (raw === undefined) return "";
        if (f.type === "YES_NO") return (raw as string) === "true" ? "Yes" : "No";
        if (Array.isArray(raw)) return raw.join("; ");
        return raw;
      });
      const submittedAt = s.createdAt ? new Date(s.createdAt).toISOString() : "";
      return [String(i + 1), ...fieldCells, submittedAt].map(escape).join(",");
    });
    const csv = [headers.map(escape).join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const safeName = formTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    link.download = `${safeName}-responses.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{submissions.length} responses loaded</p>
        <Button variant="outline" size="sm" onClick={handleExportCsv}>
          <Download />
          Export CSV
        </Button>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left py-2 px-4 text-muted-foreground font-medium whitespace-nowrap">
                #
              </th>
              {fields.map((f) => (
                <th
                  key={f.id}
                  className="text-left py-2 px-4 text-muted-foreground font-medium whitespace-nowrap"
                >
                  {f.title}
                </th>
              ))}
              <th className="text-left py-2 px-4 text-muted-foreground font-medium whitespace-nowrap">
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
                  <td className="py-2 px-4 text-muted-foreground">{index + 1}</td>
                  {fields.map((f) => {
                    const v = formatValue(valueMap[f.id], f.type);
                    return (
                      <td key={f.id} className="py-2 px-4 max-w-48 truncate">
                        {v === "—" ? <span className="text-muted-foreground">—</span> : v}
                      </td>
                    );
                  })}
                  <td className="py-2 px-4 text-muted-foreground whitespace-nowrap">
                    {submission.createdAt ? new Date(submission.createdAt).toLocaleString() : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {hasNextPage && (
        <div className="flex justify-center pt-2">
          <Button variant="outline" onClick={onLoadMore} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              "Load more"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

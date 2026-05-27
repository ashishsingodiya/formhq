"use client";

import React, { useMemo } from "react";
import { Calendar, Star, TrendingUp, Users } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ReactWordCloud from "react-d3-cloud";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { useFormAnalytics, useGetFormBySlug, useListSubmissions } from "~/hooks/api/form";

const PIE_COLORS = [
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#ec4899",
  "#8b5cf6",
  "#06b6d4",
  "#f43f5e",
  "#84cc16",
];

function interpolateColor(ratio: number, low = "#93c5fd", high = "#1d5270"): string {
  const r1 = parseInt(low.slice(1, 3), 16);
  const g1 = parseInt(low.slice(3, 5), 16);
  const b1 = parseInt(low.slice(5, 7), 16);
  const r2 = parseInt(high.slice(1, 3), 16);
  const g2 = parseInt(high.slice(3, 5), 16);
  const b2 = parseInt(high.slice(5, 7), 16);
  const r = Math.round(r1 + (r2 - r1) * ratio);
  const g = Math.round(g1 + (g2 - g1) * ratio);
  const b = Math.round(b1 + (b2 - b1) * ratio);
  return `rgb(${r},${g},${b})`;
}

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "is",
  "it",
  "i",
  "my",
  "me",
  "we",
  "you",
  "your",
  "this",
  "that",
  "was",
  "are",
  "be",
  "as",
  "by",
  "from",
  "have",
  "has",
  "had",
  "not",
  "so",
  "do",
  "did",
  "if",
  "up",
  "out",
  "no",
  "can",
  "will",
  "just",
  "about",
  "what",
  "how",
  "all",
  "would",
  "there",
  "their",
  "they",
  "them",
  "then",
  "than",
  "when",
  "who",
  "which",
  "its",
  "our",
  "been",
  "were",
]);

const MIN_FONT = 14;
const MAX_FONT = 60;

function buildWordFrequency(
  fieldId: string,
  submissions: { values: { formFieldId: string; value: string | string[] }[] | null }[],
  topN = 60,
): { text: string; value: number }[] {
  const freq = new Map<string, number>();
  for (const s of submissions) {
    const entry = (s.values ?? []).find((v) => v.formFieldId === fieldId);
    if (!entry || typeof entry.value !== "string") continue;
    const words = entry.value
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
    for (const w of words) freq.set(w, (freq.get(w) ?? 0) + 1);
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([text, value]) => ({ text, value }));
}

function buildValueFrequency(
  fieldId: string,
  submissions: { values: { formFieldId: string; value: string | string[] }[] | null }[],
  topN = 60,
): { text: string; value: number }[] {
  const freq = new Map<string, number>();
  for (const s of submissions) {
    const entry = (s.values ?? []).find((v) => v.formFieldId === fieldId);
    if (!entry || typeof entry.value !== "string" || entry.value.trim() === "") continue;
    const key = entry.value.trim();
    freq.set(key, (freq.get(key) ?? 0) + 1);
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([text, value]) => ({ text, value }));
}

export default function AnalyticsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const { form, isLoading: formLoading } = useGetFormBySlug(slug);
  const { analytics, isLoading: analyticsLoading } = useFormAnalytics(form?.id ?? "");
  const { submissions } = useListSubmissions(form?.id ?? "");

  if (formLoading || analyticsLoading || !analytics) {
    return (
      <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
    );
  }

  const total = analytics.totalCount;
  const last7 = analytics.daily.slice(-7).reduce((acc, d) => acc + d.count, 0);

  if (total === 0) {
    return (
      <div className="px-6 py-6">
        <div className="border rounded-xl py-24 text-center text-muted-foreground">
          No data yet. Share your form to start collecting responses.
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-6 flex flex-col gap-5 max-w-5xl">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total responses" value={total.toLocaleString()} icon={Users} />
        <StatCard title="Last 7 days" value={last7.toLocaleString()} icon={TrendingUp} />
        <StatCard
          title="Last submitted"
          value={
            analytics.lastSubmittedAt
              ? new Date(analytics.lastSubmittedAt).toLocaleDateString()
              : "—"
          }
          icon={Calendar}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Submissions over the last 30 days</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v: string) => v.slice(5)}
                  stroke="var(--muted-foreground)"
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11 }}
                  stroke="var(--muted-foreground)"
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelFormatter={(v) => `Date: ${v}`}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {analytics.daily.map((d, i) => (
                    <Cell
                      key={i}
                      fill={interpolateColor(
                        d.count / Math.max(...analytics.daily.map((x) => x.count), 1),
                      )}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {analytics.fieldStats.map((field) => (
          <FieldChart
            key={field.fieldId}
            field={field}
            totalResponses={total}
            submissions={submissions ?? []}
          />
        ))}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardContent className="pt-5 flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold mt-1">{value}</p>
        </div>
        <div className="size-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
          <Icon className="size-4" />
        </div>
      </CardContent>
    </Card>
  );
}

function FieldChart({
  field,
  totalResponses,
  submissions,
}: {
  field: {
    fieldId: string;
    title: string;
    type: string;
    responseCount: number;
    average: number | null;
    distribution: { title: string; count: number }[];
  };
  totalResponses: number;
  submissions: { values: { formFieldId: string; value: string | string[] }[] | null }[];
}) {
  const FREE_TEXT_TYPES = ["SHORT_TEXT", "LONG_TEXT", "EMAIL", "NUMBER", "DATE"];
  const isFreeText = FREE_TEXT_TYPES.includes(field.type);

  const wordData = useMemo(() => {
    if (!isFreeText) return [];
    if (field.type === "NUMBER" || field.type === "DATE" || field.type === "EMAIL") {
      return buildValueFrequency(field.fieldId, submissions);
    }
    return buildWordFrequency(field.fieldId, submissions);
  }, [field.fieldId, field.type, submissions, isFreeText]);

  const wordMin = wordData[wordData.length - 1]?.value ?? 1;
  const wordMax = wordData[0]?.value ?? 1;
  const wordRange = wordMax - wordMin || 1;

  const fontSize = (word: { value: number }) =>
    MIN_FONT + Math.round(((word.value - wordMin) / wordRange) * (MAX_FONT - MIN_FONT));

  const fill = (_word: unknown, i: number) => PIE_COLORS[i % PIE_COLORS.length]!;

  if (isFreeText) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center justify-between">
            <span>{field.title}</span>
            <span className="text-xs font-normal text-muted-foreground">
              {field.responseCount} of {totalResponses} responses
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {wordData.length === 0 ? (
            <p className="text-xs text-muted-foreground">No text responses yet.</p>
          ) : (
            <div style={{ height: 220 }}>
              <ReactWordCloud
                data={wordData}
                width={460}
                height={220}
                font="Inter, sans-serif"
                fontWeight="600"
                fontSize={fontSize}
                rotate={0}
                padding={3}
                fill={fill}
                random={() => 0.5}
              />
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (field.distribution.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{field.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">No responses yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center justify-between">
          <span>{field.title}</span>
          {field.type === "RATING" && field.average !== null && (
            <span className="text-xs font-normal text-muted-foreground inline-flex items-center gap-1">
              <Star className="size-3.5 fill-current" />
              {field.average} avg
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            {field.type === "SINGLE_SELECT" || field.type === "YES_NO" ? (
              <PieChart>
                <Pie
                  data={field.distribution}
                  dataKey="count"
                  nameKey="title"
                  innerRadius={40}
                  outerRadius={70}
                >
                  {field.distribution.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            ) : (
              <BarChart data={field.distribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fontSize: 11 }}
                  stroke="var(--muted-foreground)"
                />
                <YAxis
                  type="category"
                  dataKey="title"
                  tick={{ fontSize: 11 }}
                  width={80}
                  stroke="var(--muted-foreground)"
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {field.distribution.map((d, i) => (
                    <Cell
                      key={i}
                      fill={interpolateColor(
                        d.count / Math.max(...field.distribution.map((x) => x.count), 1),
                      )}
                    />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

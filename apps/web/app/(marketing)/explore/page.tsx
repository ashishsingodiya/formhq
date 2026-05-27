"use client";

import Link from "next/link";
import { ArrowRight, ExternalLink, Search } from "lucide-react";
import { useState } from "react";
import { resolveTheme, type ThemeConfig } from "@repo/themes";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import { useListPublicForms } from "~/hooks/api/form";

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const { forms, isLoading } = useListPublicForms();

  const filtered = (forms ?? []).filter(
    (f) =>
      search === "" ||
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      (f.description ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col">
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Explore live forms</h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto mb-10">
          Browse public forms created by the FormHQ community. Find one you like and fill it in.
        </p>
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search forms..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-24">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-56 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-32 text-center flex flex-col items-center gap-3">
            <p className="text-muted-foreground">
              {search ? "No forms match your search." : "No live forms currently."}
            </p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-sm text-primary hover:underline"
              >
                Clear search
              </button>
            )}
            <div className="mt-4">
              <Button asChild variant="outline" size="sm" className="gap-1.5">
                <Link href="/signup">
                  Create your own
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((form) => {
              const theme = resolveTheme(form.themeConfig as ThemeConfig);
              const isImage = theme.background.type === "image";
              const bgStyle = isImage
                ? {
                    backgroundImage: `url(${theme.background.value})`,
                    backgroundSize: "cover" as const,
                    backgroundPosition: "center" as const,
                  }
                : { background: theme.background.value };

              return (
                <div
                  key={form.id}
                  className="group border border-border/60 rounded-xl overflow-hidden hover:border-border hover:shadow-md transition-all"
                >
                  <div
                    className="h-40 p-5 flex flex-col justify-between relative overflow-hidden"
                    style={bgStyle}
                  >
                    {isImage && (
                      <div
                        className="absolute inset-0"
                        style={{
                          background: `rgba(0,0,0,${(theme.background as { overlay?: number }).overlay ?? 0.4})`,
                        }}
                      />
                    )}
                    <div className="relative z-10">
                      <p
                        className="text-base font-semibold leading-snug"
                        style={{ color: theme.colors.foreground }}
                      >
                        {form.title}
                      </p>
                    </div>
                    <div className="relative z-10 flex gap-1.5">
                      {[1, 2, 3].map((j) => (
                        <div
                          key={j}
                          className="h-1.5 rounded-full"
                          style={{
                            background: theme.colors.primary,
                            opacity: j === 1 ? 1 : j === 2 ? 0.5 : 0.25,
                            width: j === 1 ? 32 : j === 2 ? 20 : 12,
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs text-emerald-600 font-medium">Live</span>
                    </div>
                    {form.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                        {form.description}
                      </p>
                    )}
                    <Button size="sm" className="w-full gap-1.5 mt-1" asChild>
                      <Link href={`/form/${form.slug}`} target="_blank">
                        Fill this form
                        <ExternalLink className="size-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="border-t border-border/50 bg-muted/20 py-20 text-center">
        <div className="max-w-xl mx-auto px-6">
          <h2 className="text-2xl font-bold tracking-tight mb-3">Want your form here?</h2>
          <p className="text-muted-foreground mb-8">
            Create a form, set it to Public, and publish it — it will appear on this page
            automatically.
          </p>
          <Button size="lg" asChild className="gap-2">
            <Link href="/signup">
              Create a form
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

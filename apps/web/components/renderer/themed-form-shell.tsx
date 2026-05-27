"use client";

import { themeToCssVars, type ResolvedTheme } from "@repo/themes";

export function ThemedFormShell({
  theme,
  children,
}: {
  theme: ResolvedTheme;
  children: React.ReactNode;
}) {
  const vars = themeToCssVars(theme);

  const bgValue = vars["--theme-page-bg"] ?? theme.colors.background;

  const isImage = theme.background.type === "image";
  const overlay = isImage ? Number(vars["--theme-page-overlay"] ?? "0.4") : 0;
  const blurPx = isImage ? (vars["--theme-page-blur"] ?? "0px") : "0px";

  return (
    <div
      suppressHydrationWarning
      style={{ ...(vars as React.CSSProperties), color: "var(--theme-fg)", colorScheme: "light" }}
      className="relative flex flex-col min-h-screen overflow-hidden light"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-20"
        style={{ background: bgValue, filter: `blur(${blurPx})` }}
      />
      {isImage && overlay > 0 && (
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{ background: `rgba(0,0,0,${overlay})` }}
        />
      )}

      <div
        className="flex flex-col flex-1"
        style={{
          fontFamily: "var(--theme-font)",
          fontSize: "var(--theme-font-size)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

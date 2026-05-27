"use client";

import * as React from "react";
import { cn } from "~/lib/utils";

export const ThemedInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function ThemedInput({ className, style, onFocus, onBlur, ...props }, ref) {
  const [focused, setFocused] = React.useState(false);
  return (
    <input
      ref={ref}
      {...props}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      className={cn("w-full px-3 py-2 outline-none transition-colors border", className)}
      style={{
        color: "var(--theme-fg)",
        background: "var(--theme-accent)",
        borderColor: focused ? "var(--theme-primary)" : "var(--theme-border)",
        borderRadius: "var(--theme-radius)",
        ...style,
      }}
    />
  );
});

export const ThemedTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function ThemedTextarea({ className, style, onFocus, onBlur, ...props }, ref) {
  const [focused, setFocused] = React.useState(false);
  return (
    <textarea
      ref={ref}
      {...props}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      className={cn("w-full px-3 py-2 outline-none transition-colors resize-y border", className)}
      style={{
        color: "var(--theme-fg)",
        background: "var(--theme-accent)",
        borderColor: focused ? "var(--theme-primary)" : "var(--theme-border)",
        borderRadius: "var(--theme-radius)",
        ...style,
      }}
    />
  );
});

// ── Label ──────────────────────────────────────────────────────────────────
export function ThemedLabel({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      {...props}
      className={cn("block text-sm font-medium", className)}
      style={{ color: "var(--theme-fg)", fontWeight: "var(--theme-heading-weight)" }}
    />
  );
}

export const ThemedButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "outline";
  }
>(function ThemedButton({ className, variant = "primary", style, ...props }, ref) {
  const themed: React.CSSProperties =
    variant === "primary"
      ? {
          background: "var(--theme-primary)",
          color: "var(--theme-primary-fg)",
          borderRadius: "var(--theme-button-radius)",
        }
      : {
          background: "transparent",
          color: "var(--theme-fg)",
          border: "1px solid var(--theme-border)",
          borderRadius: "var(--theme-button-radius)",
        };

  return (
    <button
      ref={ref}
      {...props}
      className={cn(
        "px-4 py-2 text-sm font-medium transition-opacity disabled:opacity-50",
        "hover:opacity-90",
        className,
      )}
      style={{ ...themed, ...style }}
    />
  );
});

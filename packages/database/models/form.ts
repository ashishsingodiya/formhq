import {
  boolean,
  integer,
  json,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { usersTable } from "./user";

export const formVisibilityEnum = pgEnum("form_visibility_enum", ["PUBLIC", "UNLISTED"]);

export type FormVisibility = (typeof formVisibilityEnum.enumValues)[number];

export type ThemeColors = {
  background: string;
  foreground: string;
  primary: string;
  primaryForeground: string;
  accent: string;
  muted: string;
  border: string;
  destructive: string;
};

export type ThemeBackground =
  | { type: "solid"; value: string }
  | { type: "gradient"; value: string }
  | { type: "image"; value: string; overlay?: number; blur?: number };

export type FontKey =
  | "geist"
  | "inter"
  | "dm-sans"
  | "space-grotesk"
  | "lora"
  | "playfair"
  | "instrument-serif"
  | "jetbrains-mono";

export type ThemeTypography = {
  fontKey: FontKey;
  fontSize: "sm" | "base" | "lg";
  headingWeight: "normal" | "medium" | "semibold" | "bold";
};

export type ThemeShape = {
  radius: "none" | "sm" | "md" | "lg" | "full";
  buttonStyle: "default" | "rounded" | "sharp" | "pill";
};

export type ThemeLayout = {
  density: "compact" | "comfortable";
  alignment: "left" | "center";
};

export type ResolvedTheme = {
  colors: ThemeColors;
  background: ThemeBackground;
  typography: ThemeTypography;
  shape: ThemeShape;
  layout: ThemeLayout;
};

export type ThemeOverrides = {
  colors?: Partial<ThemeColors>;
  background?: ThemeBackground;
  typography?: Partial<ThemeTypography>;
  shape?: Partial<ThemeShape>;
  layout?: Partial<ThemeLayout>;
};

export type ThemeConfig = {
  presetId: string;
  overrides?: ThemeOverrides;
};

export type ThemePreset = {
  id: string;
  name: string;
  preview?: string;
  theme: ResolvedTheme;
};

// ─── Table ───────────────────────────────────────────────────────────────────
export const formsTable = pgTable("forms", {
  id: uuid("id").primaryKey().defaultRandom(),

  slug: varchar("slug", { length: 30 }).unique().notNull(),

  title: varchar("title", { length: 55 }).notNull(),
  description: varchar("description", { length: 300 }),

  isPublished: boolean("is_published").default(false).notNull(),
  publishedAt: timestamp("published_at"),

  visibility: formVisibilityEnum("visibility").default("UNLISTED").notNull(),

  themeConfig: json("theme_config").$type<ThemeConfig>().default({ presetId: "default" }).notNull(),

  expiresAt: timestamp("expires_at"),
  responseLimit: integer("response_limit"),

  createdBy: uuid("created_by").references(() => usersTable.id),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),

  deletedAt: timestamp("deleted_at"),
});

export type SelectForm = typeof formsTable.$inferSelect;
export type InsertForm = typeof formsTable.$inferInsert;

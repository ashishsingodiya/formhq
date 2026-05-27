import {
  boolean,
  index,
  json,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { formsTable } from "./form";

export const fieldTypeEnum = pgEnum("field_type_enum", [
  "SHORT_TEXT",
  "LONG_TEXT",
  "EMAIL",
  "NUMBER",
  "SINGLE_SELECT",
  "MULTI_SELECT",
  "RATING",
  "DATE",
  "YES_NO",
]);

export type FieldType = (typeof fieldTypeEnum.enumValues)[number];

export type FieldOption = {
  value: string;
  label: string;
};

export type FieldConfig =
  | {
      type: "SHORT_TEXT";
      minLength?: number;
      maxLength?: number;
      regex?: string;
      regexMessage?: string;
    }
  | {
      type: "LONG_TEXT";
      minLength?: number;
      maxLength?: number;
    }
  | {
      type: "EMAIL";
    }
  | {
      type: "NUMBER";
      min?: number;
      max?: number;
      integer?: boolean;
    }
  | {
      type: "SINGLE_SELECT";
      options: FieldOption[];
      display?: "dropdown" | "radio";
    }
  | {
      type: "MULTI_SELECT";
      options: FieldOption[];
      minSelected?: number;
      maxSelected?: number;
      display?: "checkbox" | "tags";
    }
  | {
      type: "RATING";
      max?: number;
      icon?: "star" | "heart" | "thumb";
    }
  | {
      type: "DATE";
      minDate?: string;
      maxDate?: string;
    }
  | {
      type: "YES_NO";
      yesLabel?: string;
      noLabel?: string;
    };

export const formFieldsTable = pgTable(
  "form_fields",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    title: varchar("title", { length: 100 }).default("Untitled question").notNull(),

    description: text("description"),

    placeholder: text("placeholder"),

    isRequired: boolean("is_required").default(false).notNull(),

    order: numeric("order", { scale: 2 }).notNull(),

    type: fieldTypeEnum("type").notNull(),

    config: json("config").$type<FieldConfig>().notNull(),

    formId: uuid("form_id").references(() => formsTable.id),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (table) => [
    unique("form_id_order_unique").on(table.formId, table.order),
    index("form_id_idx").on(table.formId),
  ],
);

export type SelectFormField = typeof formFieldsTable.$inferSelect;
export type InsertFormField = typeof formFieldsTable.$inferInsert;

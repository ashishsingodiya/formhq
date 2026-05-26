import {
  boolean,
  index,
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
  "TEXT",
  "NUMBER",
  "EMAIL",
  "YES_NO",
  "PASSWORD",
]);

export const formFieldsTable = pgTable(
  "form_fields",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    label: varchar("label", { length: 100 }).notNull(),
    labelKey: varchar("label_key", { length: 100 }).notNull(),

    description: text("description"),

    placeholder: text("placeholder"),

    isRequired: boolean("is_required").default(false).notNull(),

    order: numeric("order", { scale: 2 }).notNull(),

    type: fieldTypeEnum("type").notNull(),

    formId: uuid("form_id").references(() => formsTable.id),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (table) => [
    unique("form_id_order_unique").on(table.formId, table.order),
    unique("form_id_label_key_unique").on(table.formId, table.labelKey),
    index("form_id_idx").on(table.formId),
  ],
);

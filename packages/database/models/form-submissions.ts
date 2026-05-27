import { index, json, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { formsTable } from "./form";

export interface FormSubmissionValue {
  formFieldId: string;
  value: string | string[];
}

export type FormSubmissionValueRow = FormSubmissionValue[];

export const formSubmissionTable = pgTable(
  "form_submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    formId: uuid("form_id")
      .references(() => formsTable.id)
      .notNull(),

    values: json("values").$type<FormSubmissionValueRow>(),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [index("form_submissions_form_id_idx").on(table.formId)],
);

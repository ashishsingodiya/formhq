import { z } from "zod";

export const fieldTypeEnum = z.enum([
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

export type FieldTypeEnum = z.infer<typeof fieldTypeEnum>;

const fieldOption = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
});

export type FieldOption = z.infer<typeof fieldOption>;

export const fieldConfig = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("SHORT_TEXT"),
    minLength: z.number().int().min(0).optional(),
    maxLength: z.number().int().min(1).optional(),
    regex: z.string().optional(),
    regexMessage: z.string().optional(),
  }),
  z.object({
    type: z.literal("LONG_TEXT"),
    minLength: z.number().int().min(0).optional(),
    maxLength: z.number().int().min(1).optional(),
  }),
  z.object({
    type: z.literal("EMAIL"),
  }),
  z.object({
    type: z.literal("NUMBER"),
    min: z.number().optional(),
    max: z.number().optional(),
    integer: z.boolean().optional(),
  }),
  z.object({
    type: z.literal("SINGLE_SELECT"),
    options: z.array(fieldOption).min(1),
    display: z.enum(["dropdown", "radio"]).optional(),
  }),
  z.object({
    type: z.literal("MULTI_SELECT"),
    options: z.array(fieldOption).min(1),
    minSelected: z.number().int().min(0).optional(),
    maxSelected: z.number().int().min(1).optional(),
    display: z.enum(["checkbox", "tags"]).optional(),
  }),
  z.object({
    type: z.literal("RATING"),
    max: z.number().int().min(2).max(10).optional(),
    icon: z.enum(["star", "heart", "thumb"]).optional(),
  }),
  z.object({
    type: z.literal("DATE"),
    minDate: z.string().optional(),
    maxDate: z.string().optional(),
  }),
  z.object({
    type: z.literal("YES_NO"),
    yesLabel: z.string().optional(),
    noLabel: z.string().optional(),
  }),
]);

export type FieldConfigSchema = z.infer<typeof fieldConfig>;

export function defaultConfigForType(type: FieldTypeEnum): FieldConfigSchema {
  switch (type) {
    case "SHORT_TEXT":
      return { type: "SHORT_TEXT" };
    case "LONG_TEXT":
      return { type: "LONG_TEXT" };
    case "EMAIL":
      return { type: "EMAIL" };
    case "NUMBER":
      return { type: "NUMBER" };
    case "SINGLE_SELECT":
      return {
        type: "SINGLE_SELECT",
        options: [
          { value: "option-1", label: "Option 1" },
          { value: "option-2", label: "Option 2" },
        ],
        display: "radio",
      };
    case "MULTI_SELECT":
      return {
        type: "MULTI_SELECT",
        options: [
          { value: "option-1", label: "Option 1" },
          { value: "option-2", label: "Option 2" },
        ],
        display: "checkbox",
      };
    case "RATING":
      return { type: "RATING", max: 5, icon: "star" };
    case "DATE":
      return { type: "DATE" };
    case "YES_NO":
      return { type: "YES_NO" };
  }
}

export const createFieldInput = z
  .object({
    formId: z.uuid().describe("UUID of the form"),
    title: z.string().min(1).max(100).optional().describe("Question title"),
    type: fieldTypeEnum.describe("Type of the field"),
    description: z.string().optional().describe("Helper text"),
    placeholder: z.string().optional().describe("Placeholder text"),
    isRequired: z.boolean().optional().default(false),
    config: fieldConfig.optional().describe("Per-type validation/display config"),
  })
  .refine((data) => !data.config || data.config.type === data.type, {
    message: "config.type must match field type",
    path: ["config", "type"],
  });

export type CreateFieldInputType = z.infer<typeof createFieldInput>;

export const updateFieldInput = z.object({
  fieldId: z.uuid().describe("UUID of the field"),
  title: z.string().min(1).max(100).optional(),
  description: z.string().nullable().optional(),
  placeholder: z.string().nullable().optional(),
  isRequired: z.boolean().optional(),
  type: fieldTypeEnum
    .optional()
    .describe("Change field type — resets config to default if config not provided"),
  config: fieldConfig.optional(),
  order: z.string().optional().describe("numeric(scale:2) order key"),
});

export type UpdateFieldInputType = z.infer<typeof updateFieldInput>;

export const deleteFieldInput = z.object({
  fieldId: z.uuid().describe("UUID of the field to delete"),
});

export type DeleteFieldInputType = z.infer<typeof deleteFieldInput>;

export const getFieldsInput = z.object({
  formId: z.uuid().describe("UUID of the form"),
});

export type GetFieldsInputType = z.infer<typeof getFieldsInput>;

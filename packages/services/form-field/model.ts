import { z } from "zod";

const fieldTypeEnum = z.enum(["TEXT", "NUMBER", "EMAIL", "YES_NO", "PASSWORD"]);

export const createFieldInput = z.object({
  formId: z.uuid().describe("UUID of the form"),
  label: z.string().min(1).max(100).describe("Display label of the field"),
  type: fieldTypeEnum.describe("Type of the field"),
  description: z.string().optional().describe("Helper text for the field"),
  placeholder: z.string().optional().describe("Placeholder text"),
  isRequired: z.boolean().optional().default(false).describe("Whether the field is required"),
});

export type CreateFieldInputType = z.infer<typeof createFieldInput>;

export const updateFieldInput = z.object({
  fieldId: z.uuid().describe("UUID of the field"),
  label: z.string().min(1).max(100).optional().describe("Updated label"),
  type: fieldTypeEnum.optional().describe("Updated field type"),
  description: z.string().nullable().optional().describe("Updated helper text"),
  placeholder: z.string().nullable().optional().describe("Updated placeholder"),
  isRequired: z.boolean().optional().describe("Updated required flag"),
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

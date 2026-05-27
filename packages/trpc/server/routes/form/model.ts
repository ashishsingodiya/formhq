import { z } from "zod";

const fieldTypeEnum = z.enum(["TEXT", "NUMBER", "EMAIL", "YES_NO", "PASSWORD"]);

export const createFormInputModel = z.object({
  title: z.string().min(1).max(55).describe("Title of the form"),
  description: z.string().max(300).optional().describe("Description of the form"),
});

export const createFormOutputModel = z.object({
  id: z.string().describe("UUID of the created form"),
});

export const listFormsInputModel = z.undefined();

export const listFormsOutputModel = z.array(
  z.object({
    id: z.string().describe("UUID of the form"),
    slug: z.string().describe("Slug of the form"),
    title: z.string().describe("Title of the form"),
    description: z.string().nullable().optional().describe("Description of the form"),
    createdAt: z.date().nullable().describe("Creation date of the form"),
  }),
);

export const createFieldInputModel = z.object({
  formId: z.string().describe("UUID of the form"),
  label: z.string().min(1).max(100).describe("Display label of the field"),
  type: fieldTypeEnum.describe("Type of the field"),
  description: z.string().optional().describe("Helper text for the field"),
  placeholder: z.string().optional().describe("Placeholder text"),
  isRequired: z.boolean().optional().default(false).describe("Whether the field is required"),
});

export const createFieldOutputModel = z.object({
  id: z.string().describe("UUID of the created field"),
});

export const updateFieldInputModel = z.object({
  fieldId: z.string().describe("UUID of the field"),
  label: z.string().min(1).max(100).optional().describe("Updated label"),
  type: fieldTypeEnum.optional().describe("Updated field type"),
  description: z.string().nullable().optional().describe("Updated helper text"),
  placeholder: z.string().nullable().optional().describe("Updated placeholder"),
  isRequired: z.boolean().optional().describe("Updated required flag"),
});

export const updateFieldOutputModel = z.object({
  id: z.string().describe("UUID of the updated field"),
});

export const deleteFieldInputModel = z.object({
  fieldId: z.string().describe("UUID of the field to delete"),
});

export const deleteFieldOutputModel = z.object({
  id: z.string().describe("UUID of the deleted field"),
});

export const getFieldsInputModel = z.object({
  formId: z.string().describe("UUID of the form"),
});

export const getFieldsOutputModel = z.array(
  z.object({
    id: z.string(),
    label: z.string(),
    labelKey: z.string(),
    type: fieldTypeEnum,
    description: z.string().nullable(),
    placeholder: z.string().nullable(),
    isRequired: z.boolean(),
    order: z.string(),
  }),
);

export const getFormBySlugInputModel = z.object({
  slug: z.string().describe("Slug of the form"),
});

export const getFormBySlugOutputModel = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  createdBy: z.string().nullable(),
  createdAt: z.date().nullable(),
});

export const getPublicFormBySlugInputModel = z.object({
  slug: z.string().describe("Slug of the form"),
});

export const getPublicFormBySlugOutputModel = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  fields: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      labelKey: z.string(),
      type: fieldTypeEnum,
      description: z.string().nullable(),
      placeholder: z.string().nullable(),
      isRequired: z.boolean(),
      order: z.string(),
    }),
  ),
});

export const submitFormInputModel = z.object({
  formId: z.string().describe("UUID of the form"),
  values: z
    .array(
      z.object({
        formFieldId: z.string().describe("UUID of the form field"),
        value: z.string().describe("Value submitted for the field"),
      }),
    )
    .min(1),
});

export const submitFormOutputModel = z.object({
  id: z.string().describe("UUID of the submission"),
});

export const listSubmissionsInputModel = z.object({
  formId: z.string().describe("UUID of the form"),
});

export const listSubmissionsOutputModel = z.array(
  z.object({
    id: z.string(),
    values: z
      .array(
        z.object({
          formFieldId: z.string(),
          value: z.string(),
        }),
      )
      .nullable(),
    createdAt: z.date().nullable(),
  }),
);

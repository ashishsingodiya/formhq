import { z } from "zod";

const fieldTypeEnum = z.enum([
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

const fontKey = z.enum([
  "geist",
  "inter",
  "dm-sans",
  "space-grotesk",
  "lora",
  "playfair",
  "instrument-serif",
  "jetbrains-mono",
]);

const themeBackground = z.discriminatedUnion("type", [
  z.object({ type: z.literal("solid"), value: z.string() }),
  z.object({ type: z.literal("gradient"), value: z.string() }),
  z.object({
    type: z.literal("image"),
    value: z.string(),
    overlay: z.number().min(0).max(1).optional(),
    blur: z.number().min(0).max(20).optional(),
  }),
]);

const themeOverrides = z.object({
  colors: z
    .object({
      background: z.string().optional(),
      foreground: z.string().optional(),
      primary: z.string().optional(),
      primaryForeground: z.string().optional(),
      accent: z.string().optional(),
      muted: z.string().optional(),
      border: z.string().optional(),
      destructive: z.string().optional(),
    })
    .optional(),
  background: themeBackground.optional(),
  typography: z
    .object({
      fontKey: fontKey.optional(),
      fontSize: z.enum(["sm", "base", "lg"]).optional(),
      headingWeight: z.enum(["normal", "medium", "semibold", "bold"]).optional(),
    })
    .optional(),
  shape: z
    .object({
      radius: z.enum(["none", "sm", "md", "lg", "full"]).optional(),
      buttonStyle: z.enum(["default", "rounded", "sharp", "pill"]).optional(),
    })
    .optional(),
  layout: z
    .object({
      density: z.enum(["compact", "comfortable"]).optional(),
      alignment: z.enum(["left", "center"]).optional(),
    })
    .optional(),
});

const themeConfig = z.object({
  presetId: z.string().min(1),
  overrides: themeOverrides.optional(),
});

const fieldOption = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
});

const fieldConfig = z.discriminatedUnion("type", [
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
  z.object({ type: z.literal("EMAIL") }),
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
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    description: z.string().nullable().optional(),
    isPublished: z.boolean(),
    visibility: z.enum(["PUBLIC", "UNLISTED"]),
    createdAt: z.date().nullable(),
  }),
);

export const listPublicFormsInputModel = z.undefined();

export const listPublicFormsOutputModel = z.array(
  z.object({
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    themeConfig: z.any(),
    createdAt: z.date().nullable(),
  }),
);

export const updateFormInputModel = z.object({
  formId: z.string().describe("UUID of the form"),
  title: z.string().min(1).max(55).optional(),
  description: z.string().max(300).nullable().optional(),
  isPublished: z.boolean().optional(),
  visibility: z.enum(["PUBLIC", "UNLISTED"]).optional(),
  themeConfig: themeConfig.optional(),
  expiresAt: z.date().nullable().optional(),
  responseLimit: z.number().int().min(1).nullable().optional(),
});

export const updateFormOutputModel = z.object({
  id: z.string().describe("UUID of the updated form"),
});

export const deleteFormInputModel = z.object({
  formId: z.string().describe("UUID of the form to delete"),
});

export const deleteFormOutputModel = z.object({
  id: z.string().describe("UUID of the deleted form"),
});

export const getFormBySlugInputModel = z.object({
  slug: z.string().describe("Slug of the form"),
});

export const getFormBySlugOutputModel = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  isPublished: z.boolean(),
  publishedAt: z.date().nullable(),
  visibility: z.enum(["PUBLIC", "UNLISTED"]),
  themeConfig: z.any(),
  expiresAt: z.date().nullable(),
  responseLimit: z.number().nullable(),
  createdBy: z.string().nullable(),
  createdAt: z.date().nullable(),
});

export const createFieldInputModel = z.object({
  formId: z.string().describe("UUID of the form"),
  title: z.string().min(1).max(100).optional().describe("Question title"),
  type: fieldTypeEnum.describe("Type of the field"),
  description: z.string().optional(),
  placeholder: z.string().optional(),
  isRequired: z.boolean().optional().default(false),
  config: fieldConfig.optional(),
});

export const createFieldOutputModel = z.object({
  id: z.string().describe("UUID of the created field"),
});

export const updateFieldInputModel = z.object({
  fieldId: z.string().describe("UUID of the field"),
  title: z.string().min(1).max(100).optional(),
  description: z.string().nullable().optional(),
  placeholder: z.string().nullable().optional(),
  isRequired: z.boolean().optional(),
  type: fieldTypeEnum.optional(),
  config: fieldConfig.optional(),
  order: z.string().optional(),
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

const fieldOutputShape = z.object({
  id: z.string(),
  title: z.string(),
  type: fieldTypeEnum,
  description: z.string().nullable(),
  placeholder: z.string().nullable(),
  isRequired: z.boolean(),
  order: z.string(),
  config: fieldConfig,
});

export const getFieldsOutputModel = z.array(fieldOutputShape);

export const getPublicFormBySlugInputModel = z.object({
  slug: z.string().describe("Slug of the form"),
});

export const getPublicFormBySlugOutputModel = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  themeConfig: z.any(),
  fields: z.array(fieldOutputShape),
});

export const submitFormInputModel = z.object({
  formId: z.string().describe("UUID of the form"),
  values: z
    .array(
      z.object({
        formFieldId: z.string().describe("UUID of the form field"),
        value: z.union([z.string(), z.array(z.string())]).describe("Value submitted for the field"),
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
          value: z.union([z.string(), z.array(z.string())]),
        }),
      )
      .nullable(),
    createdAt: z.date().nullable(),
  }),
);

const submissionShape = z.object({
  id: z.string(),
  values: z
    .array(
      z.object({
        formFieldId: z.string(),
        value: z.union([z.string(), z.array(z.string())]),
      }),
    )
    .nullable(),
  createdAt: z.date().nullable(),
});

export const listSubmissionsPaginatedInputModel = z.object({
  formId: z.string().describe("UUID of the form"),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).optional().default(30),
});

export const listSubmissionsPaginatedOutputModel = z.object({
  submissions: z.array(submissionShape),
  nextCursor: z.string().nullable(),
});

export const getDashboardStatsInputModel = z.undefined();

export const getDashboardStatsOutputModel = z.object({
  totalForms: z.number(),
  publishedForms: z.number(),
  totalResponses: z.number(),
});

export const getAnalyticsInputModel = z.object({
  formId: z.string().describe("UUID of the form"),
});

export const getAnalyticsOutputModel = z.object({
  totalCount: z.number(),
  lastSubmittedAt: z.date().nullable(),
  daily: z.array(
    z.object({
      date: z.string(),
      count: z.number(),
    }),
  ),
  fieldStats: z.array(
    z.object({
      fieldId: z.string(),
      title: z.string(),
      type: fieldTypeEnum,
      responseCount: z.number(),
      average: z.number().nullable(),
      distribution: z.array(
        z.object({
          title: z.string(),
          count: z.number(),
        }),
      ),
    }),
  ),
});

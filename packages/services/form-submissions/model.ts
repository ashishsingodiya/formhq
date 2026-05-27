import { z } from "zod";

export const submitFormInput = z.object({
  formId: z.uuid().describe("UUID of the form"),
  values: z
    .array(
      z.object({
        formFieldId: z.uuid().describe("UUID of the form field"),
        value: z.union([z.string(), z.array(z.string())]).describe("Value submitted for the field"),
      }),
    )
    .min(1)
    .describe("Array of field responses"),
});

export type SubmitFormInputType = z.infer<typeof submitFormInput>;

export const listSubmissionsInput = z.object({
  formId: z.uuid().describe("UUID of the form"),
});

export type ListSubmissionsInputType = z.infer<typeof listSubmissionsInput>;

export const listSubmissionsPaginatedInput = z.object({
  formId: z.uuid().describe("UUID of the form"),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).optional().default(30),
});

export type ListSubmissionsPaginatedInputType = z.infer<typeof listSubmissionsPaginatedInput>;

export const getDashboardStatsInput = z.object({
  userId: z.uuid().describe("UUID of the user"),
});

export type GetDashboardStatsInputType = z.infer<typeof getDashboardStatsInput>;

export const getAnalyticsInput = z.object({
  formId: z.uuid().describe("UUID of the form"),
});

export type GetAnalyticsInputType = z.infer<typeof getAnalyticsInput>;

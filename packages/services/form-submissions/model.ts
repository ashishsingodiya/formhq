import { z } from "zod";

export const submitFormInput = z.object({
  formId: z.uuid().describe("UUID of the form"),
  values: z
    .array(
      z.object({
        formFieldId: z.uuid().describe("UUID of the form field"),
        value: z.string().describe("Value submitted for the field"),
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

import { z } from "zod";

export const createFormInput = z.object({
  title: z.string().min(1).max(55).describe("Title of the form"),
  description: z.string().max(300).optional().describe("Description of the form"),
  createdBy: z.uuid().describe("UUID of the user creating the form"),
});

export type CreateFormInputType = z.infer<typeof createFormInput>;

export const listFormsByUserIdInput = z.object({
  userId: z.uuid().describe("UUID of the user"),
});

export type ListFormsByUserIdInputType = z.infer<typeof listFormsByUserIdInput>;

export const getFormBySlugInput = z.object({
  slug: z.string().describe("Slug of the form"),
});

export type GetFormBySlugInputType = z.infer<typeof getFormBySlugInput>;

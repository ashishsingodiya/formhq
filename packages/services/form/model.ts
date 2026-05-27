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

export const deleteFormInput = z.object({
  formId: z.uuid().describe("UUID of the form to delete"),
  userId: z.uuid().describe("UUID of the user deleting the form"),
});

export type DeleteFormInputType = z.infer<typeof deleteFormInput>;

const themeOverrides = z
  .object({
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
    background: z
      .discriminatedUnion("type", [
        z.object({ type: z.literal("solid"), value: z.string() }),
        z.object({ type: z.literal("gradient"), value: z.string() }),
        z.object({
          type: z.literal("image"),
          value: z.string(),
          overlay: z.number().min(0).max(1).optional(),
          blur: z.number().min(0).max(20).optional(),
        }),
      ])
      .optional(),
    typography: z
      .object({
        fontKey: z
          .enum([
            "geist",
            "inter",
            "dm-sans",
            "space-grotesk",
            "lora",
            "playfair",
            "instrument-serif",
            "jetbrains-mono",
          ])
          .optional(),
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
  })
  .strict();

export const themeConfig = z.object({
  presetId: z.string().min(1),
  overrides: themeOverrides.optional(),
});

export const updateFormInput = z.object({
  formId: z.uuid(),
  userId: z.uuid(),
  title: z.string().min(1).max(55).optional(),
  description: z.string().max(300).nullable().optional(),
  isPublished: z.boolean().optional(),
  visibility: z.enum(["PUBLIC", "UNLISTED"]).optional(),
  themeConfig: themeConfig.optional(),
  expiresAt: z.date().nullable().optional(),
  responseLimit: z.number().int().min(1).nullable().optional(),
});

export type UpdateFormInputType = z.infer<typeof updateFormInput>;

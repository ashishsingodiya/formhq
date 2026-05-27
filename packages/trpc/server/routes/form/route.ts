import { formFieldService, formService, formSubmissionService } from "../../services";
import { authenticatedProcedure, publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import {
  createFieldInputModel,
  createFieldOutputModel,
  createFormInputModel,
  createFormOutputModel,
  deleteFieldInputModel,
  deleteFieldOutputModel,
  deleteFormInputModel,
  deleteFormOutputModel,
  getFieldsInputModel,
  getFieldsOutputModel,
  getFormBySlugInputModel,
  getFormBySlugOutputModel,
  getPublicFormBySlugInputModel,
  getPublicFormBySlugOutputModel,
  listFormsInputModel,
  listFormsOutputModel,
  listSubmissionsInputModel,
  listSubmissionsOutputModel,
  submitFormInputModel,
  submitFormOutputModel,
  updateFieldInputModel,
  updateFieldOutputModel,
} from "./model";

const TAGS = ["Forms"];
const getPath = generatePath("/forms");

export const formRouter = router({
  createForm: authenticatedProcedure
    .meta({ openapi: { method: "POST", path: getPath("createForm"), tags: TAGS, protect: true } })
    .input(createFormInputModel)
    .output(createFormOutputModel)
    .mutation(async ({ input, ctx }) => {
      const { id } = await formService.createForm({
        title: input.title,
        description: input.description,
        createdBy: ctx.user.id,
      });
      return { id };
    }),

  listForms: authenticatedProcedure
    .meta({ openapi: { method: "GET", path: getPath("listForms"), tags: TAGS, protect: true } })
    .input(listFormsInputModel)
    .output(listFormsOutputModel)
    .query(async ({ ctx }) => {
      return formService.listFormsByUserId({ userId: ctx.user.id });
    }),

  createField: authenticatedProcedure
    .meta({ openapi: { method: "POST", path: getPath("createField"), tags: TAGS, protect: true } })
    .input(createFieldInputModel)
    .output(createFieldOutputModel)
    .mutation(async ({ input }) => {
      const { id } = await formFieldService.createField(input);
      return { id };
    }),

  updateField: authenticatedProcedure
    .meta({ openapi: { method: "PATCH", path: getPath("updateField"), tags: TAGS, protect: true } })
    .input(updateFieldInputModel)
    .output(updateFieldOutputModel)
    .mutation(async ({ input }) => {
      const { id } = await formFieldService.updateField(input);
      return { id };
    }),

  deleteField: authenticatedProcedure
    .meta({
      openapi: { method: "DELETE", path: getPath("deleteField"), tags: TAGS, protect: true },
    })
    .input(deleteFieldInputModel)
    .output(deleteFieldOutputModel)
    .mutation(async ({ input }) => {
      const { id } = await formFieldService.deleteField(input);
      return { id };
    }),

  getFields: authenticatedProcedure
    .meta({ openapi: { method: "GET", path: getPath("getFields"), tags: TAGS, protect: true } })
    .input(getFieldsInputModel)
    .output(getFieldsOutputModel)
    .query(async ({ input }) => {
      return formFieldService.getFields(input);
    }),

  getFormBySlug: authenticatedProcedure
    .meta({ openapi: { method: "GET", path: getPath("getFormBySlug"), tags: TAGS, protect: true } })
    .input(getFormBySlugInputModel)
    .output(getFormBySlugOutputModel)
    .query(async ({ input }) => {
      return formService.getFormBySlug(input);
    }),

  getPublicFormBySlug: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("getPublicFormBySlug"), tags: TAGS } })
    .input(getPublicFormBySlugInputModel)
    .output(getPublicFormBySlugOutputModel)
    .query(async ({ input }) => {
      return formService.getPublicFormBySlug(input);
    }),

  submitForm: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("submitForm"), tags: TAGS } })
    .input(submitFormInputModel)
    .output(submitFormOutputModel)
    .mutation(async ({ input }) => {
      const { id } = await formSubmissionService.submitForm(input);
      return { id };
    }),

  listSubmissions: authenticatedProcedure
    .meta({
      openapi: { method: "GET", path: getPath("listSubmissions"), tags: TAGS, protect: true },
    })
    .input(listSubmissionsInputModel)
    .output(listSubmissionsOutputModel)
    .query(async ({ input }) => {
      return formSubmissionService.listSubmissions(input);
    }),

  deleteForm: authenticatedProcedure
    .meta({ openapi: { method: "DELETE", path: getPath("deleteForm"), tags: TAGS, protect: true } })
    .input(deleteFormInputModel)
    .output(deleteFormOutputModel)
    .mutation(async ({ input, ctx }) => {
      const { id } = await formService.deleteForm({ formId: input.formId, userId: ctx.user.id });
      return { id };
    }),
});

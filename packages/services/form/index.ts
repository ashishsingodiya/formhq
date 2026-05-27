import { and, db, eq, isNull } from "@repo/database";
import { formsTable } from "@repo/database/models/form";
import { formFieldsTable } from "@repo/database/models/form-field";
import { customAlphabet } from "nanoid";
import slugify from "slugify";
import {
  createFormInput,
  CreateFormInputType,
  deleteFormInput,
  DeleteFormInputType,
  getFormBySlugInput,
  GetFormBySlugInputType,
  listFormsByUserIdInput,
  ListFormsByUserIdInputType,
  updateFormInput,
  UpdateFormInputType,
} from "./model";

const MAX_TITLE_SLUG_LEN = 23;

class FormService {
  private nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 6);

  private generateSlug(title: string): string {
    const slug = slugify(title, { lower: true, strict: true, trim: true });
    const truncated = slug.slice(0, MAX_TITLE_SLUG_LEN).replace(/-+$/, "");
    return `${truncated}-${this.nanoid()}`;
  }

  public async createForm(payload: CreateFormInputType) {
    const { title, description, createdBy } = await createFormInput.parseAsync(payload);

    const slug = this.generateSlug(title);

    const result = await db
      .insert(formsTable)
      .values({ title, description, createdBy, slug })
      .returning({ id: formsTable.id });

    if (!result || result.length === 0 || !result[0]?.id)
      throw new Error("Something went wrong while creating the form");

    return { id: result[0].id };
  }

  public async listPublicForms() {
    return db
      .select({
        id: formsTable.id,
        slug: formsTable.slug,
        title: formsTable.title,
        description: formsTable.description,
        themeConfig: formsTable.themeConfig,
        createdAt: formsTable.createdAt,
      })
      .from(formsTable)
      .where(
        and(
          eq(formsTable.isPublished, true),
          eq(formsTable.visibility, "PUBLIC"),
          isNull(formsTable.deletedAt),
        ),
      );
  }

  public async listFormsByUserId(payload: ListFormsByUserIdInputType) {
    const { userId } = await listFormsByUserIdInput.parseAsync(payload);

    return db
      .select({
        id: formsTable.id,
        slug: formsTable.slug,
        title: formsTable.title,
        description: formsTable.description,
        isPublished: formsTable.isPublished,
        visibility: formsTable.visibility,
        createdAt: formsTable.createdAt,
      })
      .from(formsTable)
      .where(and(eq(formsTable.createdBy, userId), isNull(formsTable.deletedAt)));
  }

  public async getFormBySlug(payload: GetFormBySlugInputType) {
    const { slug } = await getFormBySlugInput.parseAsync(payload);

    const result = await db
      .select({
        id: formsTable.id,
        slug: formsTable.slug,
        title: formsTable.title,
        description: formsTable.description,
        isPublished: formsTable.isPublished,
        publishedAt: formsTable.publishedAt,
        visibility: formsTable.visibility,
        themeConfig: formsTable.themeConfig,
        expiresAt: formsTable.expiresAt,
        responseLimit: formsTable.responseLimit,
        createdBy: formsTable.createdBy,
        createdAt: formsTable.createdAt,
      })
      .from(formsTable)
      .where(and(eq(formsTable.slug, slug), isNull(formsTable.deletedAt)));

    if (!result || result.length === 0) throw new Error(`Form with slug "${slug}" does not exist`);

    return result[0]!;
  }

  public async getPublicFormBySlug(payload: GetFormBySlugInputType) {
    const { slug } = await getFormBySlugInput.parseAsync(payload);

    const result = await db
      .select({
        id: formsTable.id,
        slug: formsTable.slug,
        title: formsTable.title,
        description: formsTable.description,
        themeConfig: formsTable.themeConfig,
        field: {
          id: formFieldsTable.id,
          title: formFieldsTable.title,
          type: formFieldsTable.type,
          description: formFieldsTable.description,
          placeholder: formFieldsTable.placeholder,
          isRequired: formFieldsTable.isRequired,
          order: formFieldsTable.order,
          config: formFieldsTable.config,
        },
      })
      .from(formsTable)
      .leftJoin(formFieldsTable, eq(formFieldsTable.formId, formsTable.id))
      .where(and(eq(formsTable.slug, slug), isNull(formsTable.deletedAt)))
      .orderBy(formFieldsTable.order);

    if (!result || result.length === 0) throw new Error(`Form with slug "${slug}" does not exist`);

    const form = result[0]!;
    const fields = result
      .filter((r) => r.field !== null && r.field.id !== null)
      .map((r) => r.field!);

    return {
      id: form.id,
      slug: form.slug,
      title: form.title,
      description: form.description,
      themeConfig: form.themeConfig,
      fields,
    };
  }

  public async updateForm(payload: UpdateFormInputType) {
    const { formId, userId, ...updates } = await updateFormInput.parseAsync(payload);

    if (Object.keys(updates).length === 0) throw new Error("No fields provided to update");

    const patch: Partial<typeof formsTable.$inferInsert> = {};
    if (updates.title !== undefined) patch.title = updates.title;
    if ("description" in updates) patch.description = updates.description ?? null;
    if (updates.visibility !== undefined) patch.visibility = updates.visibility;
    if (updates.themeConfig !== undefined) patch.themeConfig = updates.themeConfig;
    if ("expiresAt" in updates) patch.expiresAt = updates.expiresAt ?? null;
    if ("responseLimit" in updates) patch.responseLimit = updates.responseLimit ?? null;

    if (updates.isPublished !== undefined) {
      patch.isPublished = updates.isPublished;
      if (updates.isPublished) patch.publishedAt = new Date();
    }

    const result = await db
      .update(formsTable)
      .set(patch)
      .where(
        and(
          eq(formsTable.id, formId),
          eq(formsTable.createdBy, userId),
          isNull(formsTable.deletedAt),
        ),
      )
      .returning({ id: formsTable.id });

    if (!result || result.length === 0)
      throw new Error("Form not found or you don't have permission to update it");

    return { id: result[0]!.id };
  }

  public async deleteForm(payload: DeleteFormInputType) {
    const { formId, userId } = await deleteFormInput.parseAsync(payload);

    const result = await db
      .update(formsTable)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(formsTable.id, formId),
          eq(formsTable.createdBy, userId),
          isNull(formsTable.deletedAt),
        ),
      )
      .returning({ id: formsTable.id });

    if (!result || result.length === 0)
      throw new Error(`Form not found or you don't have permission to delete it`);

    return { id: result[0]!.id };
  }
}

export default FormService;

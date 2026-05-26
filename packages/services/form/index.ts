import { db, eq } from "@repo/database";
import { formsTable } from "@repo/database/models/form";
import { customAlphabet } from "nanoid";
import slugify from "slugify";
import {
  createFormInput,
  CreateFormInputType,
  getFormBySlugInput,
  GetFormBySlugInputType,
  listFormsByUserIdInput,
  ListFormsByUserIdInputType,
} from "./model";

class FormService {
  private nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 6);

  private generateSlug(title: string): string {
    const slug = slugify(title, {
      lower: true,
      strict: true,
      trim: true,
    });

    return `${slug}-${this.nanoid()}`;
  }

  public async createForm(payload: CreateFormInputType) {
    const { title, description, createdBy } = await createFormInput.parseAsync(payload);

    const slug = this.generateSlug(title);

    const result = await db
      .insert(formsTable)
      .values({ title, description, createdBy, slug })
      .returning({
        id: formsTable.id,
        slug: formsTable.slug,
        title: formsTable.title,
        description: formsTable.description,
        createdAt: formsTable.createdAt,
      });

    if (!result || result.length === 0 || !result[0]?.id)
      throw new Error("Something went wrong while creating the form");

    return {
      id: result[0].id,
    };
  }
  public async listFormsByUserId(payload: ListFormsByUserIdInputType) {
    const { userId } = await listFormsByUserIdInput.parseAsync(payload);

    const forms = await db
      .select({
        id: formsTable.id,
        slug: formsTable.slug,
        title: formsTable.title,
        description: formsTable.description,
        createdAt: formsTable.createdAt,
      })
      .from(formsTable)
      .where(eq(formsTable.createdBy, userId));

    return forms;
  }
  public async getFormBySlug(payload: GetFormBySlugInputType) {
    const { slug } = await getFormBySlugInput.parseAsync(payload);

    const result = await db
      .select({
        id: formsTable.id,
        slug: formsTable.slug,
        title: formsTable.title,
        description: formsTable.description,
        createdBy: formsTable.createdBy,
        createdAt: formsTable.createdAt,
      })
      .from(formsTable)
      .where(eq(formsTable.slug, slug));

    if (!result || result.length === 0) throw new Error(`Form with slug "${slug}" does not exist`);

    return result[0]!;
  }
}

export default FormService;

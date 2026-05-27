import { db, eq, sql } from "@repo/database";
import { formFieldsTable } from "@repo/database/models/form-field";
import {
  createFieldInput,
  CreateFieldInputType,
  defaultConfigForType,
  deleteFieldInput,
  DeleteFieldInputType,
  getFieldsInput,
  GetFieldsInputType,
  updateFieldInput,
  UpdateFieldInputType,
} from "./model";

class FormFieldService {
  private async getNextOrder(formId: string): Promise<string> {
    const result = await db
      .select({ maxOrder: sql<string>`max(${formFieldsTable.order})` })
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, formId));

    const max = result[0]?.maxOrder;
    if (!max) return "1.00";
    return (parseFloat(max) + 1).toFixed(2);
  }

  public async createField(payload: CreateFieldInputType) {
    const { formId, title, type, description, placeholder, isRequired, config } =
      await createFieldInput.parseAsync(payload);

    const order = await this.getNextOrder(formId);
    const fieldConfig = config ?? defaultConfigForType(type);

    const result = await db
      .insert(formFieldsTable)
      .values({
        formId,
        title,
        type,
        description,
        placeholder,
        isRequired,
        order,
        config: fieldConfig,
      })
      .returning({ id: formFieldsTable.id });

    if (!result[0]?.id) throw new Error("Something went wrong while creating the field");

    return { id: result[0].id };
  }

  public async updateField(payload: UpdateFieldInputType) {
    const { fieldId, ...updates } = await updateFieldInput.parseAsync(payload);

    if (Object.keys(updates).length === 0) throw new Error("No fields provided to update");

    if (updates.type !== undefined) {
      if (updates.config !== undefined && updates.config.type !== updates.type) {
        throw new Error(
          `config.type (${updates.config.type}) does not match new field type (${updates.type})`,
        );
      }
      if (updates.config === undefined) {
        updates.config = defaultConfigForType(updates.type);
      }
    } else if (updates.config !== undefined) {
      const existing = await db
        .select({ type: formFieldsTable.type })
        .from(formFieldsTable)
        .where(eq(formFieldsTable.id, fieldId));

      if (!existing[0]) throw new Error(`Field with ID ${fieldId} does not exist`);

      if (existing[0].type !== updates.config.type) {
        throw new Error(
          `config.type (${updates.config.type}) does not match field type (${existing[0].type})`,
        );
      }
    }

    const patch: Partial<typeof formFieldsTable.$inferInsert> = {};
    if (updates.title !== undefined) patch.title = updates.title;
    if ("description" in updates) patch.description = updates.description ?? null;
    if ("placeholder" in updates) patch.placeholder = updates.placeholder ?? null;
    if (updates.isRequired !== undefined) patch.isRequired = updates.isRequired;
    if (updates.type !== undefined) patch.type = updates.type;
    if (updates.config !== undefined) patch.config = updates.config;
    if (updates.order !== undefined) patch.order = updates.order;

    const result = await db
      .update(formFieldsTable)
      .set(patch)
      .where(eq(formFieldsTable.id, fieldId))
      .returning({ id: formFieldsTable.id });

    if (!result || result.length === 0) throw new Error(`Field with ID ${fieldId} does not exist`);

    return { id: result[0]!.id };
  }

  public async deleteField(payload: DeleteFieldInputType) {
    const { fieldId } = await deleteFieldInput.parseAsync(payload);

    await db.delete(formFieldsTable).where(eq(formFieldsTable.id, fieldId));

    return { id: fieldId };
  }

  public async getFields(payload: GetFieldsInputType) {
    const { formId } = await getFieldsInput.parseAsync(payload);

    const fields = await db
      .select({
        id: formFieldsTable.id,
        title: formFieldsTable.title,
        type: formFieldsTable.type,
        description: formFieldsTable.description,
        placeholder: formFieldsTable.placeholder,
        isRequired: formFieldsTable.isRequired,
        order: formFieldsTable.order,
        config: formFieldsTable.config,
      })
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, formId))
      .orderBy(formFieldsTable.order);

    return fields;
  }
}

export default FormFieldService;

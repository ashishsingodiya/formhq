import { db, eq, sql } from "@repo/database";
import { formFieldsTable } from "@repo/database/models/form-field";
import slugify from "slugify";
import {
  createFieldInput,
  CreateFieldInputType,
  deleteFieldInput,
  DeleteFieldInputType,
  getFieldsInput,
  GetFieldsInputType,
  updateFieldInput,
  UpdateFieldInputType,
} from "./model";

class FormFieldService {
  private generateLabelKey(label: string): string {
    return slugify(label, { lower: true, strict: true, trim: true });
  }

  private async deduplicateLabelKey(formId: string, baseKey: string): Promise<string> {
    const existing = await db
      .select({ labelKey: formFieldsTable.labelKey })
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, formId));

    const existingKeys = new Set(existing.map((r) => r.labelKey));

    if (!existingKeys.has(baseKey)) return baseKey;

    let i = 2;
    while (existingKeys.has(`${baseKey}-${i}`)) i++;
    return `${baseKey}-${i}`;
  }

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
    const { formId, label, type, description, placeholder, isRequired } =
      await createFieldInput.parseAsync(payload);

    const baseKey = this.generateLabelKey(label);
    const labelKey = await this.deduplicateLabelKey(formId, baseKey);
    const order = await this.getNextOrder(formId);

    const result = await db
      .insert(formFieldsTable)
      .values({ formId, label, labelKey, type, description, placeholder, isRequired, order })
      .returning({ id: formFieldsTable.id });

    if (!result[0]?.id) throw new Error("Something went wrong while creating the field");

    return { id: result[0].id };
  }

  public async updateField(payload: UpdateFieldInputType) {
    const { fieldId, ...updates } = await updateFieldInput.parseAsync(payload);

    const patch: Partial<typeof formFieldsTable.$inferInsert> = {};
    if (updates.label !== undefined) patch.label = updates.label;
    if (updates.type !== undefined) patch.type = updates.type;
    if ("description" in updates) patch.description = updates.description ?? null;
    if ("placeholder" in updates) patch.placeholder = updates.placeholder ?? null;
    if (updates.isRequired !== undefined) patch.isRequired = updates.isRequired;

    if (Object.keys(patch).length === 0) throw new Error("No fields provided to update");

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
        label: formFieldsTable.label,
        labelKey: formFieldsTable.labelKey,
        type: formFieldsTable.type,
        description: formFieldsTable.description,
        placeholder: formFieldsTable.placeholder,
        isRequired: formFieldsTable.isRequired,
        order: formFieldsTable.order,
      })
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, formId))
      .orderBy(formFieldsTable.order);

    return fields;
  }
}

export default FormFieldService;

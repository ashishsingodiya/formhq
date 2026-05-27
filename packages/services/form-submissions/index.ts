import { db, desc, eq } from "@repo/database";
import { formSubmissionTable } from "@repo/database/models/form-submissions";
import {
  listSubmissionsInput,
  ListSubmissionsInputType,
  submitFormInput,
  SubmitFormInputType,
} from "./model";

class FormSubmissionService {
  public async submitForm(payload: SubmitFormInputType) {
    const { formId, values } = await submitFormInput.parseAsync(payload);

    const result = await db
      .insert(formSubmissionTable)
      .values({ formId, values })
      .returning({ id: formSubmissionTable.id });

    if (!result[0]?.id) throw new Error("Something went wrong while submitting the form");

    return { id: result[0].id };
  }

  public async listSubmissions(payload: ListSubmissionsInputType) {
    const { formId } = await listSubmissionsInput.parseAsync(payload);

    const submissions = await db
      .select({
        id: formSubmissionTable.id,
        values: formSubmissionTable.values,
        createdAt: formSubmissionTable.createdAt,
      })
      .from(formSubmissionTable)
      .where(eq(formSubmissionTable.formId, formId))
      .orderBy(desc(formSubmissionTable.createdAt));

    return submissions;
  }
}

export default FormSubmissionService;

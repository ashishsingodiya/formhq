import { db } from "@repo/database";
import { formSubmissionTable } from "@repo/database/models/form-submissions";
import { submitFormInput, SubmitFormInputType } from "./model";

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
}

export default FormSubmissionService;

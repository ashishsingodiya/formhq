import { and, count, db, desc, eq, isNull, lt } from "@repo/database";
import { formsTable } from "@repo/database/models/form";
import { formFieldsTable } from "@repo/database/models/form-field";
import { formSubmissionTable } from "@repo/database/models/form-submissions";
import {
  getAnalyticsInput,
  GetAnalyticsInputType,
  getDashboardStatsInput,
  GetDashboardStatsInputType,
  listSubmissionsInput,
  ListSubmissionsInputType,
  listSubmissionsPaginatedInput,
  ListSubmissionsPaginatedInputType,
  submitFormInput,
  SubmitFormInputType,
} from "./model";

class FormSubmissionService {
  public async submitForm(payload: SubmitFormInputType) {
    const { formId, values } = await submitFormInput.parseAsync(payload);

    const formRows = await db
      .select({
        id: formsTable.id,
        isPublished: formsTable.isPublished,
        expiresAt: formsTable.expiresAt,
        responseLimit: formsTable.responseLimit,
        deletedAt: formsTable.deletedAt,
      })
      .from(formsTable)
      .where(eq(formsTable.id, formId));

    const form = formRows[0];
    if (!form || form.deletedAt) throw new Error("Form not found");

    if (!form.isPublished) {
      throw new Error("This form is not accepting responses yet");
    }

    if (form.expiresAt && form.expiresAt.getTime() <= Date.now()) {
      throw new Error("This form has stopped accepting responses");
    }

    if (form.responseLimit !== null && form.responseLimit !== undefined) {
      const [{ value: existing } = { value: 0 }] = await db
        .select({ value: count() })
        .from(formSubmissionTable)
        .where(eq(formSubmissionTable.formId, formId));

      if (existing >= form.responseLimit) {
        throw new Error("This form has reached its response limit");
      }
    }

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

  public async listSubmissionsPaginated(payload: ListSubmissionsPaginatedInputType) {
    const { formId, cursor, limit } = await listSubmissionsPaginatedInput.parseAsync(payload);

    const rows = await db
      .select({
        id: formSubmissionTable.id,
        values: formSubmissionTable.values,
        createdAt: formSubmissionTable.createdAt,
      })
      .from(formSubmissionTable)
      .where(
        cursor
          ? and(
              eq(formSubmissionTable.formId, formId),
              lt(formSubmissionTable.createdAt, new Date(cursor)),
            )
          : eq(formSubmissionTable.formId, formId),
      )
      .orderBy(desc(formSubmissionTable.createdAt))
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const submissions = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore
      ? (submissions[submissions.length - 1]!.createdAt?.toISOString() ?? null)
      : null;

    return { submissions, nextCursor };
  }

  public async getAnalytics(payload: GetAnalyticsInputType) {
    const { formId } = await getAnalyticsInput.parseAsync(payload);

    const fields = await db
      .select({
        id: formFieldsTable.id,
        title: formFieldsTable.title,
        type: formFieldsTable.type,
        config: formFieldsTable.config,
        order: formFieldsTable.order,
      })
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, formId))
      .orderBy(formFieldsTable.order);

    const submissions = await db
      .select({
        id: formSubmissionTable.id,
        values: formSubmissionTable.values,
        createdAt: formSubmissionTable.createdAt,
      })
      .from(formSubmissionTable)
      .where(eq(formSubmissionTable.formId, formId))
      .orderBy(formSubmissionTable.createdAt);

    const totalCount = submissions.length;
    const lastSubmittedAt = submissions[submissions.length - 1]?.createdAt ?? null;

    const dailyMap = new Map<string, number>();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      dailyMap.set(d.toISOString().slice(0, 10), 0);
    }
    for (const s of submissions) {
      if (!s.createdAt) continue;
      const key = new Date(s.createdAt).toISOString().slice(0, 10);
      if (dailyMap.has(key)) dailyMap.set(key, (dailyMap.get(key) ?? 0) + 1);
    }
    const daily = Array.from(dailyMap.entries()).map(([date, count]) => ({ date, count }));

    const fieldStats = fields.map((field) => {
      const valuesForField: (string | string[])[] = [];
      for (const s of submissions) {
        const entry = (s.values ?? []).find((v) => v.formFieldId === field.id);
        if (entry !== undefined) valuesForField.push(entry.value);
      }

      const responseCount = valuesForField.length;
      const distribution: { title: string; count: number }[] = [];
      let average: number | null = null;

      if (field.type === "SINGLE_SELECT" || field.type === "YES_NO") {
        const counts = new Map<string, number>();
        for (const v of valuesForField) {
          if (typeof v === "string") counts.set(v, (counts.get(v) ?? 0) + 1);
        }
        for (const [title, count] of counts.entries()) {
          distribution.push({
            title: prettytitle(field, title),
            count,
          });
        }
      } else if (field.type === "MULTI_SELECT") {
        const counts = new Map<string, number>();
        for (const v of valuesForField) {
          const arr = Array.isArray(v) ? v : [];
          for (const x of arr) counts.set(x, (counts.get(x) ?? 0) + 1);
        }
        for (const [title, count] of counts.entries()) {
          distribution.push({
            title: prettytitle(field, title),
            count,
          });
        }
      } else if (field.type === "RATING") {
        let sum = 0;
        let n = 0;
        const counts = new Map<number, number>();
        for (const v of valuesForField) {
          const num = Number(typeof v === "string" ? v : 0);
          if (Number.isFinite(num) && num > 0) {
            sum += num;
            n++;
            counts.set(num, (counts.get(num) ?? 0) + 1);
          }
        }
        average = n > 0 ? Math.round((sum / n) * 100) / 100 : null;
        const max = (field.config.type === "RATING" ? field.config.max : 5) ?? 5;
        for (let i = 1; i <= max; i++) {
          distribution.push({ title: `${i}★`, count: counts.get(i) ?? 0 });
        }
      }

      return {
        fieldId: field.id,
        title: field.title,
        type: field.type,
        responseCount,
        average,
        distribution,
      };
    });

    return { totalCount, lastSubmittedAt, daily, fieldStats };
  }

  public async getDashboardStats(payload: GetDashboardStatsInputType) {
    const { userId } = await getDashboardStatsInput.parseAsync(payload);

    const forms = await db
      .select({ id: formsTable.id, isPublished: formsTable.isPublished })
      .from(formsTable)
      .where(and(eq(formsTable.createdBy, userId), isNull(formsTable.deletedAt)));

    const formIds = forms.map((f) => f.id);
    const totalForms = forms.length;
    const publishedForms = forms.filter((f) => f.isPublished).length;

    let totalResponses = 0;
    if (formIds.length > 0) {
      for (const formId of formIds) {
        const [row] = await db
          .select({ value: count() })
          .from(formSubmissionTable)
          .where(eq(formSubmissionTable.formId, formId));
        totalResponses += row?.value ?? 0;
      }
    }

    return { totalForms, publishedForms, totalResponses };
  }
}

export default FormSubmissionService;

function prettytitle(field: { type: string; config: unknown }, rawValue: string): string {
  if (field.type === "YES_NO") {
    return rawValue === "true" ? "Yes" : "No";
  }
  const config = field.config as { type?: string; options?: { value: string; title: string }[] };
  if (config.type === "SINGLE_SELECT" || config.type === "MULTI_SELECT") {
    const opt = config.options?.find((o) => o.value === rawValue);
    return opt?.title ?? rawValue;
  }
  return rawValue;
}

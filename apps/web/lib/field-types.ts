export const FIELD_TYPES = [
  "SHORT_TEXT",
  "LONG_TEXT",
  "EMAIL",
  "NUMBER",
  "SINGLE_SELECT",
  "MULTI_SELECT",
  "RATING",
  "DATE",
  "YES_NO",
] as const;

export type FieldType = (typeof FIELD_TYPES)[number];

export const TYPE_LABELS: Record<FieldType, string> = {
  SHORT_TEXT: "Short text",
  LONG_TEXT: "Long text",
  EMAIL: "Email",
  NUMBER: "Number",
  SINGLE_SELECT: "Single select",
  MULTI_SELECT: "Multi select",
  RATING: "Rating",
  DATE: "Date",
  YES_NO: "Yes / No",
};

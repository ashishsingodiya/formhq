import type { FieldType } from "~/lib/field-types";

type FieldConfig = { type: string } & Record<string, unknown>;

export function defaultConfigForType(type: FieldType): FieldConfig {
  switch (type) {
    case "SHORT_TEXT":
      return { type: "SHORT_TEXT" };
    case "LONG_TEXT":
      return { type: "LONG_TEXT" };
    case "EMAIL":
      return { type: "EMAIL" };
    case "NUMBER":
      return { type: "NUMBER" };
    case "SINGLE_SELECT":
      return {
        type: "SINGLE_SELECT",
        options: [
          { value: "option-1", label: "Option 1" },
          { value: "option-2", label: "Option 2" },
        ],
        display: "radio",
      };
    case "MULTI_SELECT":
      return {
        type: "MULTI_SELECT",
        options: [
          { value: "option-1", label: "Option 1" },
          { value: "option-2", label: "Option 2" },
        ],
        display: "checkbox",
      };
    case "RATING":
      return { type: "RATING", max: 5, icon: "star" };
    case "DATE":
      return { type: "DATE" };
    case "YES_NO":
      return { type: "YES_NO" };
  }
}

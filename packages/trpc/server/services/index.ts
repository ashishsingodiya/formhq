import FormFieldService from "@repo/services/form-field";
import FormService from "@repo/services/form";
import FormSubmissionService from "@repo/services/form-submissions";
import UserService from "@repo/services/user";

export const userService = new UserService();
export const formService = new FormService();
export const formFieldService = new FormFieldService();
export const formSubmissionService = new FormSubmissionService();

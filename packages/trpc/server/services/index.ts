import FormFieldService from "@repo/services/form-field";
import FormService from "@repo/services/form";
import UserService from "@repo/services/user";

export const userService = new UserService();
export const formService = new FormService();
export const formFieldService = new FormFieldService();

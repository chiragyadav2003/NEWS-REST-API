import vine from "@vinejs/vine";
import { CustomErrorReporter } from "./customErrorReporter.js";

// custom error reporter
vine.errorReporter = () => new CustomErrorReporter();

export const registerSchema = vine.object({
  name: vine.string().minLength(2).maxLength(150),
  email: vine.string().email().maxLength(150),
  password: vine.string().minLength(6).maxLength(32).confirmed(),
});

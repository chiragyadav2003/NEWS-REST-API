import vine from "@vinejs/vine";
import { CustomErrorReporter } from "./customErrorReporter.js";

// custom error reporter
vine.errorReporter = () => new CustomErrorReporter();

export const newsSchema = vine.object({
  title: vine.string().minLength(6).maxLength(200),
  content: vine.string().minLength(10).maxLength(30000),
});

export const updateSchema = vine.object({
  title: vine.string().minLength(6).maxLength(200).optional(),
  content: vine.string().minLength(10).maxLength(30000).optional(),
});

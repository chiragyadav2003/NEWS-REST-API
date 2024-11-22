import vine from "@vinejs/vine";

export const registerSchema = vine.object({
  name: vine.string().minLength(2).maxLength(150),
  email: vine.string().email().maxLength(150),
  password: vine.string().minLength(8).maxLength(32).confirmed(),
});

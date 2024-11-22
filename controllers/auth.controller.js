import { prisma } from "../DB/db.config.js";
import vine, { errors } from "@vinejs/vine";
import { registerSchema } from "../validations/auth.validation.js";

export class AuthController {
  static async register(req, res) {
    try {
      const body = req.body;
      const validator = vine.compile(registerSchema);
      const payload = await validator.validate(body);
      return res.status(200).json({
        payload,
      });
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({
          success: false,
          errors: error.messages,
        });
      }
    }
  }
}

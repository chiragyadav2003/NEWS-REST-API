import { prisma } from "../DB/db.config.js";
import vine, { errors } from "@vinejs/vine";
import bcrypt from "bcryptjs";
import { registerSchema } from "../validations/auth.validation.js";

export class AuthController {
  static async register(req, res) {
    try {
      const body = req.body;

      // validate body with register schema
      const validator = vine.compile(registerSchema);
      const payload = await validator.validate(body);

      // check for user existence
      const existingUser = await prisma.user.findUnique({
        where: {
          email: payload.email,
        },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          errors: {
            email: "Email already taken.Please use another one",
          },
        });
      }

      // encrypt the password
      const salt = bcrypt.genSaltSync(10);
      payload.password = bcrypt.hashSync(payload.password, salt);

      const user = await prisma.user.create({
        data: payload,
      });

      return res.status(200).json({
        success: true,
        message: "User created successfully!!!",
        user,
      });
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({
          success: false,
          errors: error.messages,
        });
      } else {
        return res.status(500).json({
          success: false,
          message: "Something went wrong.Please try again...",
        });
      }
    }
  }
}

import vine, { errors } from "@vinejs/vine";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../DB/db.config.js";
import { loginSchema, registerSchema } from "../validations/auth.validation.js";

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

  static async login(req, res) {
    try {
      const body = req.body;

      //validate body with login schema
      const validator = vine.compile(loginSchema);
      const payload = await validator.validate(body);

      // checks if user exists or not
      const findUser = await prisma.user.findFirst({
        where: {
          email: payload.email,
        },
      });
      if (!findUser) {
        return res.status(400).json({
          success: false,
          errors: {
            email: "User does not exist for given email.",
          },
        });
      }

      // compare given password and hash stored
      const compareHash = bcrypt.compareSync(
        payload.password,
        findUser.password
      );
      if (!compareHash) {
        return res.status(400).json({
          success: false,
          errors: {
            email: "Invalid credentials.",
          },
        });
      }

      // generate access token
      const payloadData = {
        id: findUser.id,
        name: findUser.name,
        email: findUser.email,
        profile: findUser.profile,
      };
      const token = jwt.sign(payloadData, process.env.JWT_SECRET, {
        expiresIn: "365d",
      });

      return res.status(200).json({
        success: true,
        message: "Login successful!!!",
        access_token: `Bearer ${token}`,
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

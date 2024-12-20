import vine, { errors } from "@vinejs/vine";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../DB/db.config.js";
import { loginSchema, registerSchema } from "../validations/auth.validation.js";
import { logger } from "../config/logger.js";
import { emailQueue, emailQueueName } from "../jobs/sendEmail.job.js";
import { generateAccessAndRefreshToken } from "../utils/generateToken.js";
import {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from "../utils/cookieOptions.js";

export class AuthController {
  static async register(req, res) {
    try {
      const body = req.body;

      // Validate body with register schema
      const validator = vine.compile(registerSchema);
      const payload = await validator.validate(body);

      // Log user registration attempt
      logger.info(`Registration attempt for email: ${payload.email}`);

      // Check for user existence
      const existingUser = await prisma.user.findUnique({
        where: {
          email: payload.email,
        },
      });

      if (existingUser) {
        logger.warn(`Email already taken: ${payload.email}`);
        return res.status(400).json({
          success: false,
          errors: {
            email: "Email already taken. Please use another one",
          },
        });
      }

      // Encrypt the password
      const salt = bcrypt.genSaltSync(10);
      payload.password = bcrypt.hashSync(payload.password, salt);

      // Create user in the database
      const user = await prisma.user.create({
        data: payload,
      });

      logger.info(`User created successfully with email: ${payload.email}`);

      return res.status(200).json({
        success: true,
        message: "User created successfully!!!",
        user,
      });
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        logger.error(`Validation error during registration: ${error.messages}`);
        return res.status(400).json({
          success: false,
          errors: error.messages,
        });
      } else {
        logger.error(`Error during registration: ${error.message}`);
        return res.status(500).json({
          success: false,
          message: "Something went wrong. Please try again...",
        });
      }
    }
  }

  static async login(req, res) {
    try {
      const body = req.body;

      // Validate body with login schema
      const validator = vine.compile(loginSchema);
      const payload = await validator.validate(body);

      // Log login attempt
      logger.info(`Login attempt for email: ${payload.email}`);

      // Check if user exists
      const findUser = await prisma.user.findFirst({
        where: {
          email: payload.email,
        },
      });

      if (!findUser) {
        logger.warn(`User not found for email: ${payload.email}`);
        return res.status(400).json({
          success: false,
          errors: {
            email: "User does not exist for the given email.",
          },
        });
      }

      // Compare given password and hash stored
      const compareHash = bcrypt.compareSync(
        payload.password,
        findUser.password
      );
      if (!compareHash) {
        logger.warn(`Invalid credentials for email: ${payload.email}`);
        return res.status(400).json({
          success: false,
          errors: {
            email: "Invalid credentials.",
          },
        });
      }

      // Generate access and refresh tokens
      const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        findUser.id
      );

      // Set tokens in cookies
      res.cookie("accessToken", accessToken, accessTokenCookieOptions);
      res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

      logger.info(`Login successful for user with email: ${payload.email}`);

      return res.status(200).json({
        success: true,
        message: "Login successful!!!",
        access_token: `Bearer ${accessToken}`,
        refreshToken: refreshToken,
      });
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        logger.error(`Validation error during login: ${error.messages}`);
        return res.status(400).json({
          success: false,
          errors: error.messages,
        });
      } else {
        logger.error(`Error during login: ${error.message}`);
        return res.status(500).json({
          success: false,
          message: "Something went wrong. Please try again...",
        });
      }
    }
  }

  static async sendEmail(req, res) {
    try {
      const { email } = req.query;
      logger.info(`User email is : ${email}`);

      const payload = [
        {
          toEmail: email,
          subject: "Mail : 1",
          body: "<h1>This is mail:1 of 3 concurrent mails</h1>",
        },
        {
          toEmail: email,
          subject: "Mail : 2",
          body: "<h1>This is mail:2 of 3 concurrent mails</h1>",
        },
        {
          toEmail: email,
          subject: "Mail : 3",
          body: "<h1>This is mail:3 of 3 concurrent mails</h1>",
        },
      ];

      // Add email job to queue
      await emailQueue.add(emailQueueName, payload);
      logger.info(`Email jobs added successfully for user email: ${email}`);

      return res.status(200).json({
        success: true,
        message: "Job added successfully.",
      });
    } catch (error) {
      logger.error(`Error in send-email method: ${error.message}`, { error });
      return res.status(500).json({
        success: false,
        message: "Something went wrong. Please try again...",
      });
    }
  }
}

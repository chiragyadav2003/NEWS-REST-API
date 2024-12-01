import jwt from "jsonwebtoken";
import { prisma } from "../DB/db.config.js";
import { generateAccessAndRefreshToken } from "../utils/generateToken.js";
import { logger } from "../config/logger.js";
import {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from "../utils/cookieOptions.js";

export const authMiddleware = async (req, res, next) => {
  // Safely extract access token
  const accessToken =
    req.cookies.accessToken ||
    (req.headers.authorization
      ? req.headers.authorization.split(" ")[1]
      : null);
  const refreshToken = req.cookies.refreshToken;

  // Check if any token exists
  if (!accessToken && !refreshToken) {
    logger.warn("Unauthorized request: No token provided");
    return res.status(401).json({
      success: false,
      message: "Unauthorized request: no token provided",
    });
  }

  // Verify access token
  if (accessToken) {
    try {
      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
      req.user = decoded.user;
      logger.info(`Access token valid for user with id ${req.user.id}`);
      return next();
    } catch (error) {
      // Detailed error handling for token verification
      if (error.name === "TokenExpiredError") {
        logger.warn(
          "Access token expired, proceeding to refresh token validation"
        );
      } else {
        logger.error(`Invalid access token: ${error.message}`);
        return res.status(401).json({
          success: false,
          message: "Invalid access token",
        });
      }
    }
  }

  // Validate refresh token
  if (refreshToken) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );

      // Safely convert id and handle potential type issues
      const userId = Number(decoded.user.id);
      if (isNaN(userId)) {
        throw new Error("Invalid user ID");
      }

      // Check if refresh token exists in the database
      const storedRefreshToken = await prisma.user.findUnique({
        where: { id: userId },
        select: { refreshToken: true },
      });

      // Validate stored refresh token
      if (
        !storedRefreshToken ||
        storedRefreshToken.refreshToken !== refreshToken
      ) {
        logger.warn(`Invalid refresh token for user with id ${userId}`);
        return res.status(401).json({
          success: false,
          message: "Invalid refresh token",
        });
      }

      // Generate new tokens
      const { newAccessToken, newRefreshToken } =
        await generateAccessAndRefreshToken(userId);

      // Set new tokens in cookies
      res.cookie("refreshToken", newRefreshToken, refreshTokenCookieOptions);
      res.cookie("accessToken", newAccessToken, accessTokenCookieOptions);

      logger.info(
        `Generated new access and refresh tokens for user with id ${userId}`
      );

      req.user = decoded.user;
      return next();
    } catch (error) {
      logger.error(`Refresh token validation error: ${error.message}`);
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token.",
      });
    }
  }

  // If no valid token is found
  logger.warn("Access Denied: Tokens invalid or expired.");
  return res.status(401).json({
    success: false,
    message: "Access Denied. Tokens invalid or expired.",
  });
};

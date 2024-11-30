import jwt from "jsonwebtoken";
import { prisma } from "../DB/db.config.js";
import { generateAccessAndRefreshToken } from "../utils/generateToken.js";
import { logger } from "../config/logger.js";

export const authMiddleware = async (req, res, next) => {
  const accessToken =
    req.cookies.accessToken || req.headers.authorization.split(" ")[1];

  const refreshToken = req.cookies.refreshToken;

  if (!accessToken && !refreshToken) {
    logger.warn("Unauthorized request: No token provided");
    return res.status(401).json({
      success: false,
      message: "Unauthorized request : no token provided",
    });
  }

  if (accessToken) {
    try {
      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
      req.user = decoded.user; // Attach user info to request object
      logger.info(`Access token valid for user with id-${req.user.id}`);
      return next();
    } catch (error) {
      if (error.name !== "TokenExpiredError") {
        logger.error(`Invalid access token: ${error.message}`);
        return res.status(401).json({
          success: false,
          message: "Invalid access token",
        });
      } else {
        logger.warn(
          "Access token expired, proceeding to refresh token validation"
        );
      }
    }
  }

  // * if access token is expired, proceed to validate refresh token
  if (refreshToken) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );

      // Check if refresh token exists in the database
      const storedRefreshToken = await prisma.user.findUnique({
        where: { id: Number(decoded.user.id) },
        select: { refreshToken: true },
      });

      if (
        !storedRefreshToken ||
        storedRefreshToken.refreshToken !== refreshToken
      ) {
        logger.warn(
          `Invalid refresh token for user with id-${decoded.user.id}`
        );
        return res.status(401).json({
          success: false,
          message: "Invalid refresh token",
        });
      }

      // Generate new tokens
      const { newAccessToken, newRefreshToken } =
        await generateAccessAndRefreshToken(decoded.user.id);

      // Set new tokens in cookies
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      logger.info(
        `Generated new access and refresh tokens for user with id-${decoded.user.id}`
      );

      req.user = decoded.user;
      return next();
    } catch (error) {
      logger.error(`Invalid or expired refresh token: ${error.message}`);
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

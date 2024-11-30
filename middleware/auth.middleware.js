import jwt from "jsonwebtoken";
import { prisma } from "../DB/db.config.js";
import { generateAccessAndRefreshToken } from "../utils/generateToken.js";

export const authMiddleware = async (req, res, next) => {
  const accessToken =
    req.cookies.accessToken || req.headers.authorization.split(" ")[1];

  const refreshToken = req.cookies.refreshToken;

  if (!accessToken && !refreshToken) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized request : no token provided",
    });
  }

  if (accessToken) {
    try {
      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
      req.user = decoded.user; //attach user info to request object
      return next();
    } catch (error) {
      if (error.name !== "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Invalid access token",
        });
      }
    }
  }

  // * if access token is expired then proceed to validate refresh token
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
        return res.status(401).json({
          success: false,
          message: "Invalid refresh token",
        });
      }

      // Generate new tokens
      const { newAccessToken, newRefreshToken } =
        await generateAccessAndRefreshToken(decoded.user.id);

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

      req.user = decoded.user;
      return next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token.",
      });
    }
  }

  return res.status(401).json({
    success: false,
    message: "Access Denied. Tokens invalid or expired.",
  });
};

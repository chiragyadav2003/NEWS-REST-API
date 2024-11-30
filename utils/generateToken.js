import jwt from "jsonwebtoken";
import { prisma } from "../DB/db.config.js";
import { logger } from "../config/logger.js";

export const generateAccessAndRefreshToken = async (userId) => {
  try {
    logger.info(`Fetching user info from the database with id-${userId}`);
    const user = await prisma.user.findUnique({
      where: {
        id: Number(userId),
      },
    });

    if (!user) {
      logger.warn(`User with id-${userId} does not exist in the database`);
      throw new Error("User not found");
    }

    const accessTokenPayload = {
      user: {
        id: user.id,
        email: user.email,
        profile: user.profile,
        name: user.name,
      },
    };
    const refreshTokenPayload = {
      user: {
        id: user.id,
      },
    };

    logger.info(
      `Generating access and refresh tokens for user with id-${userId}`
    );
    const accessToken = generateAccessToken(accessTokenPayload);
    const refreshToken = await generateRefreshToken(refreshTokenPayload);

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error generating tokens:", error);
    logger.error(
      `Error generating access and refresh token for the user with id-${userId}: ${error.message}`
    );
    throw new Error("Failed to generate tokens");
  }
};

export const generateAccessToken = (accessTokenPayload) => {
  const accessToken = jwt.sign(
    accessTokenPayload,
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m",
    }
  );

  return accessToken;
};

export const generateRefreshToken = async (refreshTokenPayload) => {
  const refreshToken = jwt.sign(
    refreshTokenPayload,
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d",
    }
  );

  logger.info(
    `Saving refresh token for user with id-${refreshTokenPayload.user.id} in the database.`
  );
  // store the refreshed token in the database
  await prisma.user.update({
    where: { id: refreshTokenPayload.user.id },
    data: { refreshToken: refreshToken },
  });

  return refreshToken;
};

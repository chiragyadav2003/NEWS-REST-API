export const accessTokenCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: parseInt(process.env.ACCESS_TOKEN_EXPIRY) || 15 * 60 * 1000, // 15 minutes
};

export const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: parseInt(process.env.REFRESH_TOKEN_EXPIRY) || 7 * 24 * 60 * 60 * 1000, // 7 days
};

import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader === null || authHeader === undefined) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized request",
    });
  }

  const token = authHeader.split(" ")[1];

  //   verify token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized request",
      });
    }
    // if user is authorized then, append jet payload in user request
    req.user = user;
    console.log(req.user);
  });
  next();
};

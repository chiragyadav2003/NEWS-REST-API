import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { ProfileController } from "../controllers/profile.controller.js";

export const apiRouter = Router();

apiRouter.post("/auth/register", AuthController.register);

apiRouter.post("/auth/login", AuthController.login);

// Profile routes - private routes
apiRouter.get("/profile", authMiddleware, ProfileController.index);

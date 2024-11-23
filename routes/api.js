import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { ProfileController } from "../controllers/profile.controller.js";
import { NewsController } from "../controllers/news.controller.js";

export const apiRouter = Router();

apiRouter.post("/auth/register", AuthController.register);

apiRouter.post("/auth/login", AuthController.login);

// * Profile routes - private routes
apiRouter.get("/profile", authMiddleware, ProfileController.index);
apiRouter.put("/profile/:id", authMiddleware, ProfileController.update);

// * News routes
apiRouter.get("/news", NewsController.index);
apiRouter.post("/news", authMiddleware, NewsController.store);
apiRouter.get("/news/:id", NewsController.show);
apiRouter.put("/news?:id", authMiddleware, NewsController.update);
apiRouter.delete("/news/:id", authMiddleware, NewsController.destroy);

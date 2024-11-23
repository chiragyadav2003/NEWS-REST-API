import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";

export const apiRouter = Router();

apiRouter.post("/auth/register", AuthController.register);

apiRouter.post("/auth/login", AuthController.login);

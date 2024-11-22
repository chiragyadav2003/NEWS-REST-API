import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";

export const apiRouter = Router();

apiRouter.post("/auth/register", AuthController.register);

apiRouter.get("/example", (req, res) => {
  return res.json({ msg: "hello" });
});

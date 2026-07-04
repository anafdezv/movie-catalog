import { Router } from "express";

import { authRouter } from "./auth.routes.js";

export const apiRouter = Router();

apiRouter.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

apiRouter.use("/auth", authRouter);

import { Router } from "express";

import { loginUser, registerUser } from "../controllers/auth.controller.js";
import { asyncHandler } from "../utils/async-handler.js";
import { loginSchema, registerSchema } from "../validators/auth.js";

export const authRouter = Router();

authRouter.post(
  "/register",
  asyncHandler(async (request, response) => {
    const input = registerSchema.parse(request.body);
    const result = await registerUser(input);

    response.status(201).json(result);
  })
);

authRouter.post(
  "/login",
  asyncHandler(async (request, response) => {
    const input = loginSchema.parse(request.body);
    const result = await loginUser(input);

    response.status(200).json(result);
  })
);

import { Router } from "express";
import { z } from "zod";

import { loginUser, registerUser } from "../controllers/auth.controller.js";
import { asyncHandler } from "../utils/async-handler.js";

const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(6, "Password must be at least 6 characters long."),
  displayName: z.string().trim().min(2, "Display name must be at least 2 characters long."),
  avatarUrl: z.string().trim().url().optional().nullable()
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1, "Password is required.")
});

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

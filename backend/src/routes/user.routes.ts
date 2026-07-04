import { Router } from "express";
import { z } from "zod";

import { getMyActivity, updateMyProfile } from "../controllers/user.controller.js";
import { requireAuth } from "../middleware/require-auth.js";
import { asyncHandler } from "../utils/async-handler.js";

const updateProfileSchema = z
  .object({
    displayName: z.string().trim().min(2, "Display name must be at least 2 characters long.").optional(),
    avatarUrl: z.string().trim().url("Avatar URL must be valid.").nullable().optional()
  })
  .refine((input) => input.displayName !== undefined || input.avatarUrl !== undefined, {
    message: "At least one profile field is required."
  });

export const userRouter = Router();

userRouter.get(
  "/me/activity",
  requireAuth,
  asyncHandler(async (request, response) => {
    const activity = await getMyActivity(request.user!.id);
    response.json(activity);
  })
);

userRouter.patch(
  "/me",
  requireAuth,
  asyncHandler(async (request, response) => {
    const input = updateProfileSchema.parse(request.body);
    const user = await updateMyProfile(request.user!.id, input);

    response.json(user);
  })
);


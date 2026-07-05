import { Router } from "express";

import { getMyActivity, updateMyProfile } from "../controllers/user.controller.js";
import { requireAuth } from "../middleware/require-auth.js";
import { asyncHandler } from "../utils/async-handler.js";
import { updateProfileSchema } from "../validators/user.js";

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

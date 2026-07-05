import { Router } from "express";

import { upsertRating } from "../controllers/rating.controller.js";
import { requireAuth } from "../middleware/require-auth.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ratingSchema } from "../validators/rating.js";

export const ratingRouter = Router();

ratingRouter.post(
  "/",
  requireAuth,
  asyncHandler(async (request, response) => {
    const input = ratingSchema.parse(request.body);
    const rating = await upsertRating(request.user!.id, input);

    response.status(201).json(rating);
  })
);

import { Router } from "express";
import { z } from "zod";

import { upsertRating } from "../controllers/rating.controller.js";
import { requireAuth } from "../middleware/require-auth.js";
import { asyncHandler } from "../utils/async-handler.js";

const ratingSchema = z.object({
  movieId: z.coerce.number().int().positive(),
  value: z.number().int().min(1).max(5)
});

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


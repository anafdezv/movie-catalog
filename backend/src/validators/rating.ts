import { z } from "zod";

export const ratingSchema = z.object({
  movieId: z.coerce.number().int().positive(),
  value: z.number().int().min(1).max(5)
});

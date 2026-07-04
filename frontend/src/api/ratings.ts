import { apiRequest } from "@/api/client";
import type { RatingRecord } from "@/types/movie";

export const saveRating = (token: string, input: { movieId: number; value: number }) =>
  apiRequest<RatingRecord>("/ratings", {
    method: "POST",
    token,
    body: JSON.stringify(input)
  });


import { z } from "zod";

import { idParamsSchema } from "./common.js";

export const movieParamsSchema = idParamsSchema;
export const movieGenres = [
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Drama",
  "Fantasy",
  "Family",
  "Horror",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Slasher",
  "Thriller"
] as const;

export const movieSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  synopsis: z.string().trim().min(1, "Synopsis is required."),
  coverUrl: z.string().trim().url("Cover URL must be valid."),
  genre: z.enum(movieGenres),
  year: z.coerce.number().int().min(1900, "Year must be valid.").max(2100, "Year must be valid.")
});

import { Router } from "express";
import { z } from "zod";

import { createMovie, deleteMovie, getMovieById, listMovies, updateMovie } from "../controllers/movie.controller.js";
import { requireAdmin } from "../middleware/require-auth.js";
import { asyncHandler } from "../utils/async-handler.js";

const paramsSchema = z.object({
  id: z.coerce.number().int().positive()
});

const movieSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  synopsis: z.string().trim().min(1, "Synopsis is required."),
  coverUrl: z.string().trim().url("Cover URL must be valid.")
});

export const movieRouter = Router();

movieRouter.get(
  "/",
  asyncHandler(async (_request, response) => {
    const movies = await listMovies();
    response.json(movies);
  })
);

movieRouter.get(
  "/:id",
  asyncHandler(async (request, response) => {
    const { id } = paramsSchema.parse(request.params);
    const movie = await getMovieById(id);

    response.json(movie);
  })
);

movieRouter.post(
  "/",
  requireAdmin,
  asyncHandler(async (request, response) => {
    const input = movieSchema.parse(request.body);
    const movie = await createMovie(input);

    response.status(201).json(movie);
  })
);

movieRouter.put(
  "/:id",
  requireAdmin,
  asyncHandler(async (request, response) => {
    const { id } = paramsSchema.parse(request.params);
    const input = movieSchema.parse(request.body);
    const movie = await updateMovie(id, input);

    response.json(movie);
  })
);

movieRouter.delete(
  "/:id",
  requireAdmin,
  asyncHandler(async (request, response) => {
    const { id } = paramsSchema.parse(request.params);
    const result = await deleteMovie(id);

    response.json(result);
  })
);


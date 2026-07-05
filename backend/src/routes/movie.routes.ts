import { Router } from "express";

import { createMovie, deleteMovie, getMovieById, listMovies, updateMovie } from "../controllers/movie.controller.js";
import { requireAdmin } from "../middleware/require-auth.js";
import { asyncHandler } from "../utils/async-handler.js";
import { movieParamsSchema, movieSchema } from "../validators/movie.js";

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
    const { id } = movieParamsSchema.parse(request.params);
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
    const { id } = movieParamsSchema.parse(request.params);
    const input = movieSchema.parse(request.body);
    const movie = await updateMovie(id, input);

    response.json(movie);
  })
);

movieRouter.delete(
  "/:id",
  requireAdmin,
  asyncHandler(async (request, response) => {
    const { id } = movieParamsSchema.parse(request.params);
    const result = await deleteMovie(id);

    response.json(result);
  })
);

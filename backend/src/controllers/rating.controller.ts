import { prisma } from "../lib/prisma.js";
import { HttpError } from "../utils/http-error.js";

interface RatingInput {
  movieId: number;
  value: number;
}

export const upsertRating = async (userId: number, input: RatingInput) => {
  const movie = await prisma.movie.findUnique({
    where: { id: input.movieId }
  });

  if (!movie) {
    throw new HttpError(404, "Movie not found.");
  }

  return prisma.rating.upsert({
    where: {
      userId_movieId: {
        userId,
        movieId: input.movieId
      }
    },
    update: {
      value: input.value
    },
    create: {
      userId,
      movieId: input.movieId,
      value: input.value
    }
  });
};


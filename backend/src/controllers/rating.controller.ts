import { prisma } from "../lib/prisma.js";
import { HttpError } from "../utils/http-error.js";
import type { RatingInput } from "../types/rating.js";
import { roundAverageRating } from "../utils/average-rating.js";

export const upsertRating = async (userId: number, input: RatingInput) => {
  return prisma.$transaction(async (transaction) => {
    const movie = await transaction.movie.findUnique({
      where: { id: input.movieId }
    });

    if (!movie) {
      throw new HttpError(404, "Movie not found.");
    }

    const rating = await transaction.rating.upsert({
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

    const aggregate = await transaction.rating.aggregate({
      where: {
        movieId: input.movieId
      },
      _avg: {
        value: true
      }
    });

    await transaction.movie.update({
      where: { id: input.movieId },
      data: {
        avgRating: roundAverageRating(aggregate._avg.value)
      }
    });

    return rating;
  });
};

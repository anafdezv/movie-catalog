import { prisma } from "../lib/prisma.js";
import type { MovieInput } from "../types/movie.js";
import { HttpError } from "../utils/http-error.js";
import { enrichCommentsWithRatings } from "./comment-enrichment.service.js";

const movieDetailInclude = {
  comments: {
    where: {
      hidden: false
    },
    orderBy: {
      createdAt: "desc"
    },
    include: {
      user: {
        select: {
          id: true,
          displayName: true,
          avatarUrl: true
        }
      }
    }
  }
} as const;

export const listMovies = async () => {
  return prisma.movie.findMany({
    orderBy: {
      createdAt: "desc"
    }
  });
};

export const getMovieById = async (movieId: number) => {
  const movie = await prisma.movie.findUnique({
    where: { id: movieId },
    include: movieDetailInclude
  });

  if (!movie) {
    throw new HttpError(404, "Movie not found.");
  }

  const { comments, ...movieData } = movie;
  const enrichedComments = await enrichCommentsWithRatings(comments);

  return {
    ...movieData,
    comments: enrichedComments
  };
};

export const createMovie = async (input: MovieInput) => {
  return prisma.movie.create({
    data: input
  });
};

export const updateMovie = async (movieId: number, input: MovieInput) => {
  const existingMovie = await prisma.movie.findUnique({
    where: { id: movieId }
  });

  if (!existingMovie) {
    throw new HttpError(404, "Movie not found.");
  }

  return prisma.movie.update({
    where: { id: movieId },
    data: input
  });
};

export const deleteMovie = async (movieId: number) => {
  const existingMovie = await prisma.movie.findUnique({
    where: { id: movieId }
  });

  if (!existingMovie) {
    throw new HttpError(404, "Movie not found.");
  }

  await prisma.movie.delete({
    where: { id: movieId }
  });

  return { message: "Movie deleted successfully." };
};

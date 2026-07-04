import { prisma } from "../lib/prisma.js";
import { HttpError } from "../utils/http-error.js";
import { calculateAverageRating } from "../utils/movie-response.js";

interface MovieInput {
  title: string;
  synopsis: string;
  coverUrl: string;
}

const movieListInclude = {
  ratings: {
    select: {
      value: true
    }
  }
} as const;

const movieDetailInclude = {
  ratings: {
    select: {
      value: true
    }
  },
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
  const movies = await prisma.movie.findMany({
    orderBy: {
      createdAt: "desc"
    },
    include: movieListInclude
  });

  return movies.map(({ ratings, ...movie }) => ({
    ...movie,
    avgRating: calculateAverageRating(ratings.map((rating) => rating.value))
  }));
};

export const getMovieById = async (movieId: number) => {
  const movie = await prisma.movie.findUnique({
    where: { id: movieId },
    include: movieDetailInclude
  });

  if (!movie) {
    throw new HttpError(404, "Movie not found.");
  }

  const { ratings, comments, ...movieData } = movie;

  return {
    ...movieData,
    avgRating: calculateAverageRating(ratings.map((rating) => rating.value)),
    comments: comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      hidden: comment.hidden,
      flagged: comment.flagged,
      movieId: comment.movieId,
      userId: comment.userId,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      user: comment.user
    }))
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


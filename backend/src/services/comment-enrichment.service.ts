import { prisma } from "../lib/prisma.js";

interface CommentRatingTarget {
  userId: number;
  movieId: number;
}

export const enrichCommentsWithRatings = async <T extends CommentRatingTarget>(comments: T[]) => {
  if (comments.length === 0) {
    return comments.map((comment) => ({
      ...comment,
      userRating: null
    }));
  }

  const ratings = await prisma.rating.findMany({
    where: {
      OR: comments.map((comment) => ({
        userId: comment.userId,
        movieId: comment.movieId
      }))
    },
    select: {
      userId: true,
      movieId: true,
      value: true
    }
  });

  const ratingsByUserAndMovie = new Map(
    ratings.map((rating) => [`${rating.userId}:${rating.movieId}`, rating.value] as const)
  );

  return comments.map((comment) => ({
    ...comment,
    userRating: ratingsByUserAndMovie.get(`${comment.userId}:${comment.movieId}`) ?? null
  }));
};

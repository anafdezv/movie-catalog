import { prisma } from "../lib/prisma.js";
import { HttpError } from "../utils/http-error.js";
import type { CreateCommentInput, ModerateCommentInput, UpdateCommentInput } from "../types/comment.js";

const commentInclude = {
  movie: {
    select: {
      id: true,
      title: true
    }
  },
  user: {
    select: {
      id: true,
      displayName: true,
      avatarUrl: true
    }
  }
} as const;

export const listComments = async () => {
  const comments = await prisma.comment.findMany({
    orderBy: {
      createdAt: "desc"
    },
    include: commentInclude
  });

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

  return comments.map((comment) => ({
    ...comment,
    userRating:
      ratings.find((rating) => rating.userId === comment.userId && rating.movieId === comment.movieId)?.value ??
      null
  }));
};

export const createComment = async (userId: number, input: CreateCommentInput) => {
  const movie = await prisma.movie.findUnique({
    where: { id: input.movieId }
  });

  if (!movie) {
    throw new HttpError(404, "Movie not found.");
  }

  const existingComment = await prisma.comment.findFirst({
    where: {
      movieId: input.movieId,
      userId
    }
  });

  if (existingComment) {
    throw new HttpError(409, "You already commented on this movie. Edit your existing comment instead.");
  }

  return prisma.comment.create({
    data: {
      content: input.content,
      movieId: input.movieId,
      userId
    },
    include: commentInclude
  });
};

export const updateComment = async (commentId: number, userId: number, input: UpdateCommentInput) => {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId }
  });

  if (!comment) {
    throw new HttpError(404, "Comment not found.");
  }

  if (comment.userId !== userId) {
    throw new HttpError(403, "You can only edit your own comments.");
  }

  return prisma.comment.update({
    where: { id: commentId },
    data: {
      content: input.content
    },
    include: commentInclude
  });
};

export const deleteComment = async (commentId: number, userId: number) => {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId }
  });

  if (!comment) {
    throw new HttpError(404, "Comment not found.");
  }

  if (comment.userId !== userId) {
    throw new HttpError(403, "You can only delete your own comments.");
  }

  await prisma.comment.delete({
    where: { id: commentId }
  });

  return { message: "Comment deleted successfully." };
};

export const deleteCommentAsAdmin = async (commentId: number) => {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId }
  });

  if (!comment) {
    throw new HttpError(404, "Comment not found.");
  }

  await prisma.comment.delete({
    where: { id: commentId }
  });

  return { message: "Comment deleted successfully." };
};

export const moderateComment = async (commentId: number, input: ModerateCommentInput) => {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId }
  });

  if (!comment) {
    throw new HttpError(404, "Comment not found.");
  }

  return prisma.comment.update({
    where: { id: commentId },
    data: {
      hidden: input.hidden ?? comment.hidden,
      flagged: input.flagged ?? comment.flagged
    },
    include: commentInclude
  });
};

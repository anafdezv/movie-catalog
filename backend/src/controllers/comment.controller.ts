import { prisma } from "../lib/prisma.js";
import { HttpError } from "../utils/http-error.js";

interface CreateCommentInput {
  content: string;
  movieId: number;
}

interface UpdateCommentInput {
  content: string;
}

interface ModerateCommentInput {
  hidden?: boolean;
  flagged?: boolean;
}

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
  return prisma.comment.findMany({
    orderBy: {
      createdAt: "desc"
    },
    include: commentInclude
  });
};

export const createComment = async (userId: number, input: CreateCommentInput) => {
  const movie = await prisma.movie.findUnique({
    where: { id: input.movieId }
  });

  if (!movie) {
    throw new HttpError(404, "Movie not found.");
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

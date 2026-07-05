import { Router } from "express";
import { z } from "zod";

import {
  createComment,
  deleteComment,
  deleteCommentAsAdmin,
  listComments,
  moderateComment,
  updateComment
} from "../controllers/comment.controller.js";
import { requireAdmin, requireAuth } from "../middleware/require-auth.js";
import { asyncHandler } from "../utils/async-handler.js";

const paramsSchema = z.object({
  id: z.coerce.number().int().positive()
});

const createCommentSchema = z.object({
  movieId: z.coerce.number().int().positive(),
  content: z.string().trim().min(1, "Comment content is required.")
});

const updateCommentSchema = z.object({
  content: z.string().trim().min(1, "Comment content is required.")
});

const moderateCommentSchema = z
  .object({
    hidden: z.boolean().optional(),
    flagged: z.boolean().optional()
  })
  .refine((input) => input.hidden !== undefined || input.flagged !== undefined, {
    message: "At least one moderation field is required."
  });

export const commentRouter = Router();

commentRouter.get(
  "/",
  requireAdmin,
  asyncHandler(async (_request, response) => {
    const comments = await listComments();
    response.json(comments);
  })
);

commentRouter.post(
  "/",
  requireAuth,
  asyncHandler(async (request, response) => {
    const input = createCommentSchema.parse(request.body);
    const comment = await createComment(request.user!.id, input);

    response.status(201).json(comment);
  })
);

commentRouter.put(
  "/:id",
  requireAuth,
  asyncHandler(async (request, response) => {
    const { id } = paramsSchema.parse(request.params);
    const input = updateCommentSchema.parse(request.body);
    const comment = await updateComment(id, request.user!.id, input);

    response.json(comment);
  })
);

commentRouter.delete(
  "/:id",
  requireAuth,
  asyncHandler(async (request, response) => {
    const { id } = paramsSchema.parse(request.params);
    const result = await deleteComment(id, request.user!.id);

    response.json(result);
  })
);

commentRouter.delete(
  "/:id/admin",
  requireAdmin,
  asyncHandler(async (request, response) => {
    const { id } = paramsSchema.parse(request.params);
    const result = await deleteCommentAsAdmin(id);

    response.json(result);
  })
);

commentRouter.patch(
  "/:id/moderate",
  requireAdmin,
  asyncHandler(async (request, response) => {
    const { id } = paramsSchema.parse(request.params);
    const input = moderateCommentSchema.parse(request.body);
    const comment = await moderateComment(id, input);

    response.json(comment);
  })
);

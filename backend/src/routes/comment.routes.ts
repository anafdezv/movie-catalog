import { Router } from "express";

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
import {
  commentParamsSchema,
  createCommentSchema,
  moderateCommentSchema,
  updateCommentSchema
} from "../validators/comment.js";

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
    const { id } = commentParamsSchema.parse(request.params);
    const input = updateCommentSchema.parse(request.body);
    const comment = await updateComment(id, request.user!.id, input);

    response.json(comment);
  })
);

commentRouter.delete(
  "/:id",
  requireAuth,
  asyncHandler(async (request, response) => {
    const { id } = commentParamsSchema.parse(request.params);
    const result = await deleteComment(id, request.user!.id);

    response.json(result);
  })
);

commentRouter.delete(
  "/:id/admin",
  requireAdmin,
  asyncHandler(async (request, response) => {
    const { id } = commentParamsSchema.parse(request.params);
    const result = await deleteCommentAsAdmin(id);

    response.json(result);
  })
);

commentRouter.patch(
  "/:id/moderate",
  requireAdmin,
  asyncHandler(async (request, response) => {
    const { id } = commentParamsSchema.parse(request.params);
    const input = moderateCommentSchema.parse(request.body);
    const comment = await moderateComment(id, input);

    response.json(comment);
  })
);

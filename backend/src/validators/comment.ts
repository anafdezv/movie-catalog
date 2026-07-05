import { z } from "zod";

import { idParamsSchema } from "./common.js";

export const commentParamsSchema = idParamsSchema;

export const createCommentSchema = z.object({
  movieId: z.coerce.number().int().positive(),
  content: z.string().trim().min(1, "Comment content is required.")
});

export const updateCommentSchema = z.object({
  content: z.string().trim().min(1, "Comment content is required.")
});

export const moderateCommentSchema = z
  .object({
    hidden: z.boolean().optional(),
    flagged: z.boolean().optional()
  })
  .refine((input) => input.hidden !== undefined || input.flagged !== undefined, {
    message: "At least one moderation field is required."
  });

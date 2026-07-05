import { z } from "zod";

export const updateProfileSchema = z
  .object({
    displayName: z.string().trim().min(2, "Display name must be at least 2 characters long.").optional(),
    avatarUrl: z.string().trim().url("Avatar URL must be valid.").nullable().optional()
  })
  .refine((input) => input.displayName !== undefined || input.avatarUrl !== undefined, {
    message: "At least one profile field is required."
  });

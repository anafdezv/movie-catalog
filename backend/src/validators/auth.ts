import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(6, "Password must be at least 6 characters long."),
  displayName: z.string().trim().min(2, "Display name must be at least 2 characters long."),
  avatarUrl: z.string().trim().url().optional().nullable()
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1, "Password is required.")
});

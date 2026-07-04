import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import type { AuthUser } from "../types/auth.js";

const EXPIRES_IN = "7d";

export const signAuthToken = (user: AuthUser) => {
  return jwt.sign(user, env.jwtSecret, { expiresIn: EXPIRES_IN });
};

export const verifyAuthToken = (token: string) => {
  return jwt.verify(token, env.jwtSecret) as AuthUser;
};


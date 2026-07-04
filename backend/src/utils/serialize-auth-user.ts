import type { User } from "@prisma/client";

import type { AuthUser } from "../types/auth.js";

export const serializeAuthUser = (user: User): AuthUser => ({
  id: user.id,
  email: user.email,
  displayName: user.displayName,
  avatarUrl: user.avatarUrl,
  role: user.role
});


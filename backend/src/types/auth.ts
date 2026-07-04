import type { Role } from "@prisma/client";

export interface AuthUser {
  id: number;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  role: Role;
}


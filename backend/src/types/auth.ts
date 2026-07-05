import type { Role } from "@prisma/client";

export interface AuthUser {
  id: number;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  role: Role;
}

export interface RegisterInput {
  email: string;
  password: string;
  displayName: string;
  avatarUrl?: string | null;
}

export interface LoginInput {
  email: string;
  password: string;
}

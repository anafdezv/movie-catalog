export interface AuthUser {
  id: number;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  role: "USER" | "ADMIN";
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput extends LoginInput {
  displayName: string;
  avatarUrl?: string | null;
}

export interface UpdateProfileInput {
  displayName?: string;
  avatarUrl?: string | null;
}

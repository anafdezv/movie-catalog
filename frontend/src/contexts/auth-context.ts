import { createContext } from "react";

import type { AuthResponse, AuthUser, LoginInput, RegisterInput } from "@/types/auth";

export interface AuthContextValue {
  isAuthenticated: boolean;
  isAdmin: boolean;
  token: string | null;
  user: AuthUser | null;
  isHydrated: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
  setAuthState: (value: AuthResponse) => void;
  updateUser: (value: AuthUser) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

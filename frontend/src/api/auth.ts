import { apiRequest } from "@/api/client";
import type { AuthResponse, LoginInput, RegisterInput } from "@/types/auth";

export const loginRequest = (input: LoginInput) =>
  apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input)
  });

export const registerRequest = (input: RegisterInput) =>
  apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input)
  });

